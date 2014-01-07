var underscore = require('./underscore.js');

//-------- Construct ---------
function League(irc, db, options) {
    var __self = this;

    __self.irc = irc;
    __self.db = db;

    // config
    __self.config = options || {};
    __self.config.prefix = options.prefix || '!lol';
    __self.config.apikey = options.apikey || null;

    //https
    __self.https = require('https');

	__self.lolapi = {
	  summoner_id_url: 'https://prod.api.pvp.net/api/lol/na/v1.2/summoner/by-name/',
	  summoner_league_url: 'https://prod.api.pvp.net/api/lol/na/v2.2/league/by-summoner/'
	};

	__self.summoners = {};

	__self.utils = require('./utils.js');
}

//-------- Methods --------
League.prototype.start = function() {
    var __self = this;

    console.log('Start LOL');

    if (__self.config.apikey == null) {
    	console.log('LOL Api is not going to work');
    }
};

League.prototype.commands = function(data) {
    var __self = this;
    var command_check = data[3].slice(1);
	var command = data[4];

	var getSummonerIdByName = function(user, cb) {
		user = user.toLowerCase();
		if (__self.summoners[user]) {
			cb(user, __self.summoners[user].id);
            return;
		}
		
		__self.https.get(__self.lolapi.summoner_id_url + user + '?api_key=' + __self.config.apikey, function(res) {

			if (res.statusCode == 404 || res.statusCode == 401) {
				cb(null);
				return;
			}

			var buffer = '';
            res.on('data', function(d) {
            	buffer += d;
			}).on('end', function() {
				var json = JSON.parse(buffer);
	            __self.summoners[user] = {
	            	'id': json.id
	            };

	            cb(user, json.id);
			}).on('error', function(e) {
				console.log(e);
			});
        });
	};

	var getSoloRank = function(user, id, cb) {

		// probably don't want to cache this
		// if (__self.summoners[user].solorank) {
		// 	cb(__self.summoners[user].solorank);
		// return;
		// }

		__self.https.get(__self.lolapi.summoner_league_url + id + '?api_key=' + __self.config.apikey, function(res) {

			if (res.statusCode == 404 || res.statusCode == 401) {
				cb(null);
				return;
			}

			var buffer = '';
            res.on('data', function(d) {
            	buffer += d;
			}).on('end', function() {
				var json = JSON.parse(buffer);

				var ranking = underscore.find(json[id].entries, function(obj) {
					return obj.playerOrTeamId == id;
				});

				var solorank = (ranking != null) ? json[id].tier + ' ' + ranking.rank : json[id].tier;

				if (__self.summoners[user] != null) {
		            __self.summoners[user] = {
		            	'solorank': solorank
		            };
		        }

	            cb(solorank);
			}).on('error', function(e) {
				console.log(e);
			});
        });
	};

	if(command_check === __self.config.prefix) {
		var user = '';
		//some summoner names are more than 1 word...
		for (var i=5; i <= data.length; i++) {
			if (typeof(data[i]) !== 'undefined') {
				user += data[i];
				user += (i != data.length-1) ? ' ' : '';
			}
		}
		var userdisplay = user;

		switch(command) {
			case 'solorank':
				getSummonerIdByName(user, function(user, id) {
					if (id !== null) {
						getSoloRank(user, id, function(rank) {
							if (rank !== null) {
								__self.irc.emit('message',{message:'> ' + userdisplay + '\'s solo rank is ' + rank});
							} else {
								__self.irc.emit('message',{message:'> Can\'t find ' + userdisplay + '\'s solo rank...'});
							}
						});
					} else {
						__self.irc.emit('message',{message:'> Nobody knows who ' + userdisplay + ' is...'});
					}
				});
				break;
			default:
				console.log('default switch');
				__self.irc.emit('message',{message:'> you are gay'});
				break;
		}
	}

};

module.exports = function(irc, db, options) {
    return new League(irc, db, options);
};