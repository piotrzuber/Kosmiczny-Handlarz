import * as fs from 'fs';
import * as sqlite3 from 'sqlite3';
const bcrypt = require('bcrypt');
import * as constant from './const';

// clear existing db
function deleteDB() {
    if (fs.existsSync(constant.DB)) {
        fs.unlinkSync(constant.DB);
    }
}

//create new db
function createDB() {
    let db = new sqlite3.Database(constant.DB);
    db.serialize(() => {
        db.run('CREATE TABLE users (nick TEXT, passwd TEXT);');
        let hashPasswd1 = bcrypt.hashSync("Szynka", constant.rounds);
        let hashPasswd2 = bcrypt.hashSync("Podptak", constant.rounds);
        let hashPasswd3 = bcrypt.hashSync("123", constant.rounds);
        db.run('INSERT INTO users (nick, passwd) VALUES (?, ?);', ["Mamatata", hashPasswd1]);
        db.run('INSERT INTO users (nick, passwd) VALUES (?, ?);', ["Kiwi", hashPasswd2]);
        db.run('INSERT INTO users (nick, passwd) VALUES (?, ?);', ["Kammsy", hashPasswd3]);
        db.all('SELECT nick, passwd FROM users;', [], (err, entries) => {
            if (err) {
                throw(err);
            }
            for (let {nick, passwd} of entries) {
                console.log(nick + ' : ' + passwd);
            }
        })
        db.run('CREATE TABLE games (game TEXT, data TEXT);');
        db.run('INSERT INTO games (game, data) VALUES (?, ?);', ['default', JSON.stringify(constant.default_data)]);

        db.close();
    });
}

deleteDB();
createDB();