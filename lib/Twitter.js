/*
 Twitter client app
 */

var OAuth = require('oauth').OAuth;
var qs = require('qs');
var util = require ('util')


function Twitter(config) {
    this.consumerKey = config.consumerKey;
    this.consumerSecret = config.consumerSecret;
    this.accessToken = config.accessToken;
    this.accessTokenSecret = config.accessTokenSecret;
    this.callBackUrl = config.callBackUrl;
    this.baseUrl = 'https://api.twitter.com/1.1';
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
            console.log('oauth.token: ' + oauth.token);
            console.log('oauth.token_secret: ' + oauth.token_secret);
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

                console.log('oauth.token: ' + oauth.token);
                console.log('oauth.token_secret: ' + oauth.token_secret);
                console.log('oauth.access_token: ' + access_token.token);
                console.log('oauth.access_token_secret: ' + oauth.access_token_secret);
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
    var body = qs.stringify(params)
    var url = this.baseUrl + path;
    this.doPostRequest(url, body, success, error)
};

Twitter.prototype.doGetRequest = function (method, url, success, error) {
    this.oauth.get(url, this.accessToken, this.accessTokenSecret, function (err, body, response) {
        console.log('URL [%s]', url);
        if (!err && response.statusCode == 200) {
            success(body);
        } else {
            error(err, response, body);
        }
    });
};

Twitter.prototype.doPostRequest = function (method, url, post_body, success, error) {
    this.oauth.post(url, this.accessToken, this.accessTokenSecret, post_body, function (err, body, response) {
        console.log('URL [%s]', url);
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
