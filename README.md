feed-to-tweet
=========

[![NPM](https://nodei.co/npm/feed-to-tweet.png)](https://npmjs.org/package/feed-to-tweet)

Easily power Twitter bots with content feeds.

* Supports multiple source feeds

* Keyword filtering to only Tweet the matching items

* Configurable feed checking interval

* Configurable Tweet interval, to reduce flooding

* No persistent storage required

# Usage

1. Install

```
npm install feed-to-tweet
```

2. Use in your script

```
var feedToTweet = require('feed-to-tweet');

feedToTweet({
  feeds: [
    {
      feedURL: 'http://www.funnycatsite.com/rss/all/'
      formatter: function(item) {
        return 'OH YOU CATS! ' + item.title + ' ' + item.link;
      }
    }
  ],
  twitterCfg: {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
  }
});
```

# Options

* `feeds`: Array of feed objects. See example above. Formatter is optional.
* `twitterConfig`: Object with Twitter keys and tokens. See example above.
* `keywords`: Array of strings. Only items with titles matching these are tweeted.
* `checkIntervalMins`: Checks feeds every X minutes (default 60)
* `tweetIntervalSecs`: Waits X seconds between posts to reduce flooding (default 10)

# Evaluation Method

The script checks the feed item's pubDate property, and if the difference
between it and the current time is less than the checkIntervalMins value you
specified, the item will be Tweeted.

There's a risk of double-tweets or missed-tweets if you stop and restart the
script, but under normal conditions this method works good enough.

# TODO

* 
