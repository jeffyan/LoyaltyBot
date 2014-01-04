/**
 * api:
 *      DB([required options])
 *          required options - {host, user, password, database}
 *
 * example:
 *      var db = require('./lib/plugins/db.js')({
 *          host        : 'localhost',
 *          user        : 'user',
 *          password    : 'password',
 *          database    : 'database',
 *      });
 */

var mysql = require('mysql'),
    file = require('fs');

//-------- Construct ---------
function DB(options) {
    var __self = this;

    // config
    __self.host = options.host || '';
    __self.user = options.user || '';
    __self.password = options.password || '';
    __self.database = options.database || '';
    __self.port = options.port || '3306';
}

//-------- Methods ---------
DB.prototype.start = function() {
    var __self = this, commands ='', viewers = '';

    // table structure for table commands
    commands += 'CREATE TABLE IF NOT EXISTS `commands` (';
    commands += '`id` int(11) NOT NULL AUTO_INCREMENT,';
    commands += '`command` text COLLATE utf8_unicode_ci NOT NULL,';
    commands += '`text` longtext COLLATE utf8_unicode_ci NOT NULL,';
    commands += '`auth` int(11) NOT NULL DEFAULT \'1\',';
    commands += 'PRIMARY KEY (`id`)';
    commands += ') ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci AUTO_INCREMENT=1';

    // table structure for table viewers
    viewers += 'CREATE TABLE IF NOT EXISTS `viewers` (';
    viewers += '`user` varchar(64) COLLATE utf8_unicode_ci NOT NULL,';
    viewers += '`points` int(11) NOT NULL,';
    viewers += 'PRIMARY KEY (`user`)';
    viewers += ') ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;';

    // execute sql, create tables if they don't exist
    __self.execute(commands + '; ' + viewers, function(){});
};

DB.prototype.execute = function(sql, callback) {
    var __self = this,
        connection = mysql.createConnection({
            host               : __self.host,
            port               : __self.port,
            user               : __self.user,
            password           : __self.password,
            database           : __self.database,
            multipleStatements : true
        });

    // execute query
    connection.query(sql, function (err, rows, fields) {
        // error handling
        if (err) {
            file.appendFile('./../logs/error-log.txt', err.message + '\r\n' + err.stack + '\r\n', function() {});
            return;
        }

        // close connection
        connection.end();

        // return results
        callback(rows, fields);
    });
};

module.exports = function (options) {
    return new DB(options);
};