/*

Example usage: Bot that powers the @intenttoship Twitter account.

*/

var feedToTwitter = require('./index');

var twitterCfg = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
  access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
};

var feeds = [
  // Test feed
  {
    feedURL: 'https://infinite-rss.glitch.me/?itemTitleBase=Does%20this%20element%20show%20up:%20%3Celement%3E&itemCount=1',
    formatter: function(item) {
      return 'Element test: ' + item.title + ' ' + item.link + ' ' + Date.now();
    }
  },
  /*
  {
    feedURL: 'https://groups.google.com/forum/feed/mozilla.dev.platform/topics/rss.xml?num=50',
    searches: ['^intent to '],
    formatter: function(item) {
      return 'Gecko: ' + item.title + ' ' + item.link;
    }
  },
  {
    feedURL:'https://groups.google.com/a/chromium.org/forum/feed/blink-dev/topics/rss.xml?num=50',
    searches: ['^intent to '],
    formatter: function(item) {
      return 'Blink: ' + item.title + ' ' + item.link;
    }
  },
  {
    feedURL: 'https://webkit.org/feed/atom/',
    searches: ['^Release Notes for Safari Technology Preview'],
    formatter: function(item) {
      return 'Webkit: ' + item.title + ' ' + item.link;
    }
  },
  {
    feedURL: 'https://developer.microsoft.com/en-us/microsoft-edge/platform/status/rss/',
    formatter: function(item) {
      return 'Edge: ' + item.title + ' ' + item.link;
    }
  }
  */
];

feedToTwitter({
  feeds: feeds,
  twitterConfig: twitterCfg,
  // Filter all feeds
  //searches: ['^intent to '],
  checkIntervalMins: 6000,
  tweetIntervalSecs: 10,
  debug: 1
});
