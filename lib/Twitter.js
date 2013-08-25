/*
 Twitter client app
 */

var OAuth = require('oauth').OAuth;
var qs = require('qs');
var util = require('util');
var https = require('https');


function Twitter(config) {
    this.consumerKey = config.consumerKey;
    this.consumerSecret = config.consumerSecret;
    this.accessToken = config.accessToken;
    this.accessTokenSecret = config.accessTokenSecret;
    this.callBackUrl = config.callBackUrl;
    this.baseUrl = 'https://api.twitter.com/1.1';
    this.streamUrl = 'https://stream.twitter.com/1.1';
    this.oauth = new OAuth(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        this.consumerKey,
        this.consumerSecret,
        '1.0',
        this.callBackUrl,
        'HMAC-SHA1'
    );
}

Twitter.prototype.getOAuthRequestToken = function (next) {
    this.oauth.getOAuthRequestToken(function (error, oauth_token, oauth_token_secret, results) {
        if (error) {
            console.log('ERROR: ' + util.inspect(error));
            next();
        }
        else {
            var oauth = {};
            oauth.token = oauth_token;
            oauth.token_secret = oauth_token_secret;
            next(oauth);
        }
    });
};

Twitter.prototype.getOAuthAccessToken = function (oauth, next) {
    this.oauth.getOAuthAccessToken(oauth.token, oauth.token_secret, oauth.verifier,
        function (error, oauth_access_token, oauth_access_token_secret, results) {
            if (error) {
                console.log('ERROR: ' + util.inspect(error));
                next();
            } else {
                oauth.access_token = oauth_access_token;
                oauth.access_token_secret = oauth_access_token_secret;
                next(oauth);
            }
        }
    );
}

Twitter.prototype.verifyCredentials = function(success, error) {
    var path = '/account/verify_credentials.json';
    var url = this.baseUrl + path;
    this.doGetRequest(url, success, error);
};

Twitter.prototype.getUserTimeline = function (params, success, error) {
    var path = '/statuses/user_timeline.json' + this.buildQS(params);
    var url = this.baseUrl + path;
    this.doGetRequest(url, success, error);
};

Twitter.prototype.getMentionsTimeline = function (params, success, error) {
    var path = '/statuses/mentions_timeline.json' + this.buildQS(params);
    var url = this.baseUrl + path;
    this.doGetRequest(url, success, error);
};

Twitter.prototype.getHomeTimeline = function (params, success, error) {
    var path = '/statuses/home_timeline.json' + this.buildQS(params);
    var url = this.baseUrl + path;
    this.doGetRequest(url, success, error);
};

Twitter.prototype.getReTweetsOfMe = function (params, success, error) {
    var path = '/statuses/retweets_of_me.json' + this.buildQS(params);
    var url = this.baseUrl + path;
    this.doGetRequest(url, success, error);
};

Twitter.prototype.getTweet = function (params, success, error) {
    var path = '/statuses/show.json' + this.buildQS(params);
    var url = this.baseUrl + path;
    this.doGetRequest(url, success, error);
};

Twitter.prototype.search = function (params, success, error) {
    var path = '/search/tweets.json' + this.buildQS(params);
    var url = this.baseUrl + path;
    this.doGetRequest(url, success, error);

};

Twitter.prototype.sendTweet = function(params, success, error) {
    var path = '/statuses/update.json';
    var url = this.baseUrl + path;
    this.doPostRequest(url, params, success, error)
};

Twitter.prototype.streamFilter = function(params, success, error) {
    //Credit to https://gist.github.com/ryanmcgrath/833401. Used heavily.
    var data, escapeSequence, opts, path, request, url;
    data = '';
    escapeSequence = '\r\n';
    path = '/statuses/filter.json' + this.buildQS(params);
    url = this.streamUrl + path;
    authorization = this.oauth.authHeader(url, this.accessToken, this.accessTokenSecret, 'POST');
    opts = {
        host: 'stream.twitter.com',
        path: '/1.1' + path,
        method: 'POST',
        headers: {
            'Connection': 'keep-alive',
            'Accept': '*/*',
            'User-Agent': 'Twitter JS Client via Node',
            'Authorization': authorization
        }
    };
    request = https.request(opts, function responseFunc (response) {
        response.setEncoding('utf-8');
        response.on('data', function (chunk) {
            var index, json;
            data += chunk.toString('utf-8');
            while((index = data.indexOf(escapeSequence)) > -1) {
                rawTweet = data.slice(0, index);
                data = data.slice(index+2);
                if(rawTweet.length > 0){
                    success(rawTweet);
                }
            }
        });
    });

    request.write(this.buildQS(params));
    request.on('error', error)
    request.end();
};

Twitter.prototype.doGetRequest = function (url, success, error) {
    this.oauth.get(url, this.accessToken, this.accessTokenSecret, function (err, body, response) {
        if (!err && response.statusCode == 200) {
            success(body);
        } else {
            error(err, response, body);
        }
    });
};

Twitter.prototype.doPostRequest = function (url, post_body, success, error) {
    this.oauth.post(url, this.accessToken, this.accessTokenSecret, post_body, function (err, body, response) {
        if (!err && response.statusCode == 200) {
            success(body);
        } else {
            error(err, response, body);
        }
    });
};

Twitter.prototype.buildQS = function (params) {
    if (params && Object.keys(params).length > 0) {
        return '?' + qs.stringify(params);
    }
    return '';
};

if (!(typeof exports === 'undefined')) {
    module.exports = exports = Twitter;
}
