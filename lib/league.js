//-------- Construct ---------
function League(irc, db, options) {
    var __self = this;

    __self.irc = irc;
    __self.db = db;

    // config
    __self.config = options || {};
    __self.config.prefix = options.prefix || '!lol';
    __self.config.apikey = options.apikey || null;
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
	var command = data[4].slice(1);
	var user = data[5].slice(1);

	if(command_check === __self.config.prefix) {

		__self.irc.emit('message',{message: 'fuck off bitch'});
		switch(command) {
			case 'solorank':
				__self.irc.emit('message',{message:"solo rank?"});
				break;
			default:
				__self.irc.emit('message',{message:"you are gay"});
				break;
		}
	}

};

module.exports = function(irc, db, options) {
    return new League(irc, db, options);
};