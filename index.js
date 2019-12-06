'use strict';

// Modularizerism.
module.exports = function(cfg) {

  let twitterConfig = cfg.twitterConfig;

  let feeds = cfg.feeds || [];

  // Tweets the item the title contains any of the terms
  // This is backward compatible with old "keywords" param.
  let searches = cfg.keywords ? cfg.keywords : (cfg.searches || []);

  // How often to check feeds, in minutes.
  // Defaults to once an hour.
  let feedUpdateIntervalMins = cfg.checkIntervalMins || 60;

  // How often to process queue, in seconds.
  // Defaults to every 10 seconds
  let queueUpdateIntervalSecs = cfg.tweetIntervalSecs || 10;

  // Debug mode
  const DEBUG = cfg.debug || false;

  /****** END CONFIGURABLE BITS ******************/

  const FeedParser = require('feedparser'),
      request = require('request'),
      Twitter = require('twitter');

  let queue = [],
      lastFeedCheck = null;

  let client = new Twitter(twitterConfig);

  function tweet(msg) {
    client.post('statuses/update', {status: msg},  function(error, tweetinfo, response) {
      if (error) {
        console.error(error);
      }
    });
  }

  function parseFeeds(feeds) {
    feeds.forEach(parseFeed);
  }

  function parseFeed(feedCfg) {
    let req = request(feedCfg.feedURL)
      , feedparser = new FeedParser();

    req.on('error', function (error) {
      // handle any request errors
      console.error('parseFeed', error)
    });
    req.on('response', function (res) {
      let stream = this;

      if (res.statusCode != 200) {
        return this.emit('error', new Error('Bad status code: ' + res.statusCode));
      }

      stream.pipe(feedparser);
    });

    feedparser.on('error', function(error) {
      // always handle errors
      console.error('feedparser error', error);
    });
    feedparser.on('readable', function() {
      // This is where the action is!
      let stream = this
        , meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
        , item;

      while (item = stream.read()) {
        onItem(item, feedCfg);
      }
    });
  }

  // Process an item found in a feed
  //
  // If item is newer than configured feed check interval
  // then add it to the queue.
  function onItem(item, feedCfg) {
    let pubDate = new Date(item.pubdate),
        diff = Date.now() - pubDate.getTime(),
        diffInMins = (diff / 1000) / 60;

    // The feedparser module overly cleans .title, so prefer the
    // raw version if available.
    let title = item['rss:title'] ? item['rss:title']['#'] : item.title;

    let filters = feedCfg.searches ? searches.concat(feedCfg.searches) : searches;
    let titleMatches = filters.length ? doesMatch(title, filters) : true;

    if (titleMatches && diffInMins < feedUpdateIntervalMins) {
      item.title = decodeHTMLEntities(title);
      let msg = feedCfg.formatter ? feedCfg.formatter(item) :
        title + ' ' + item.link;
      queue.push(msg);
    }
  }

  function doesMatch(stringToSearch, searches) {
    return searches.some(function(search) {
      return (new RegExp(search, 'i')).test(stringToSearch);
    });
  }


  // Supports entity names
  function decodeHTMLEntities(str) {
    return str.replace(/&#?(\w+);/g, function(match, code) {
      if (isNaN(code)) {
        let namedEntities = {
          quot: 34, amp: 38, lt: 60, gt: 62, nbsp: 160, copy: 169, reg: 174,
          deg: 176, frasl: 47, trade: 8482, euro: 8364, Agrave: 192, Aacute: 193,
          Acirc: 194, Atilde: 195, Auml: 196, Aring: 197, AElig: 198, Ccedil: 199,
          Egrave: 200, Eacute: 201, Ecirc: 202, Euml: 203, Igrave: 204,
          Iacute: 205, Icirc: 206, Iuml: 207, ETH: 208, Ntilde: 209, Ograve: 210,
          Oacute: 211, Ocirc: 212, Otilde: 213, Ouml: 214, times: 215,
          Oslash: 216, Ugrave: 217, Uacute: 218, Ucirc: 219, Uuml: 220,
          Yacute: 221, THORN: 222, szlig: 223, agrave: 224, aacute: 225,
          acirc: 226, atilde: 227, auml: 228, aring: 229, aelig: 230, ccedil: 231,
          egrave: 232, eacute: 233, ecirc: 234, euml: 235, igrave: 236,
          iacute: 237, icirc: 238, iuml: 239, eth: 240, ntilde: 241, ograve: 242,
          oacute: 243, ocirc: 244, otilde: 245, ouml: 246, divide: 247,
          oslash: 248, ugrave: 249, uacute: 250, ucirc: 251, uuml: 252,
          yacute: 253, thorn: 254, yuml: 255, lsquo: 8216, rsquo: 8217,
          sbquo: 8218, ldquo: 8220, rdquo: 8221, bdquo: 8222, dagger: 8224,
          Dagger: 8225, permil: 8240, lsaquo: 8249, rsaquo: 8250, spades: 9824,
          clubs: 9827, hearts: 9829, diams: 9830, oline: 8254, larr: 8592,
          uarr: 8593, rarr: 8594, darr: 8595, hellip: 133, ndash: 150, mdash: 151,
          iexcl: 161, cent: 162, pound: 163, curren: 164, yen: 165, brvbar: 166,
          brkbar: 166, sect: 167, uml: 168, die: 168, ordf: 170, laquo: 171,
          not: 172, shy: 173, macr: 175, hibar: 175, plusmn: 177, sup2: 178,
          sup3: 179, acute: 180, micro: 181, para: 182, middot: 183, cedil: 184,
          sup1: 185, ordm: 186, raquo: 187, frac14: 188, frac12: 189, frac34: 190,
          iquest: 191, Alpha: 913, alpha: 945, Beta: 914, beta: 946, Gamma: 915,
          gamma: 947, Delta: 916, delta: 948, Epsilon: 917, epsilon: 949,
          Zeta: 918, zeta: 950, Eta: 919, eta: 951, Theta: 920, theta: 952,
          Iota: 921, iota: 953, Kappa: 922, kappa: 954, Lambda: 923, lambda: 955,
          Mu: 924, mu: 956, Nu: 925, nu: 957, Xi: 926, xi: 958, Omicron: 927,
          omicron: 959, Pi: 928, pi: 960, Rho: 929, rho: 961, Sigma: 931,
          sigma: 963, Tau: 932, tau: 964, Upsilon: 933, upsilon: 965, Phi: 934,
          phi: 966, Chi: 935, chi: 967, Psi: 936, psi: 968, Omega: 937, omega: 969
        };
        if (namedEntities[code] !== undefined) {
          code = namedEntities[code];
        }
      }
      return String.fromCharCode(code);
    });
  }

  // Notify registered channels of item.
  // Only supports Twitter atm.
  function notify(msg) {
    if (DEBUG) {
      console.log(msg);
    }
    tweet(msg);
  }

  // Initiate feed check driver
  setInterval(function feedDriver() {
    parseFeeds(feeds);
  }, feedUpdateIntervalMins * 60 * 1000)

  // Kickoff at script start
  parseFeeds(feeds);

  // Inititate queue processing driver
  setInterval(function queueDriver() {
    if (queue.length) {
      notify(queue.shift())
    }
  }, queueUpdateIntervalSecs * 1000)

}
