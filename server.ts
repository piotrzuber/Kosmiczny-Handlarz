const express = require('express');
const app = express();
app.use(function(req, res, next) {
  res.header('Content-Type', 'application/json');
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, access-control-allow-origin");
  next();
});
const port = 8080;
const router = express.Router();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
// app.use(bodyParser.json());
app.use(express.json());

let db = new sqlite3.Database('game.db', sqlite3.OPEN_READWRITE, (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the game database.');
});

app.get('/api/v0/games', (req, res) => {
  db.all('SELECT game, data FROM games;', (err, entries) => {
    if (err) {
      res.sendStatus(500);
      throw (err);
    } else {
      let results = new Array();

      for (let entry of entries) {
        console.log(entry.game);
        console.log(entry.data);
        results.push({ game: entry.game, data: JSON.parse(entry.data) });
      }
      console.log(JSON.stringify(results));

      res.status(200);
      res.send(JSON.stringify(results));
    }
  });
});

app.get('/api/v0/games/:game', (req, res) => {
  db.all('SELECT game, data FROM games;', [], (err, games) => {
    if (err) {
      res.sendStatus(500);
      throw(err);
    } else {
      console.log('looking for game: ' + decodeURIComponent(req.params.game));
      for (let {game, data} of games) {
        if (game === decodeURIComponent(req.params.game)) {
          res.status(200);
          res.send(data);
          return;
        }
      }
      res.sendStatus(404);
    }
  });
});

app.put('/api/v0/games', (req, res) => {
  db.serialize(() => {
    let body = req.body;
    db.all('SELECT game FROM games;', [], (err, games) => {
      if (err) {
        res.sendStatus(500);
        throw(err);
      } else {
        for (let game of games) {
          if (game === body.game) {
            res.sendStatus(403);
            return;
          }
        }
      }
    })
    db.run('INSERT INTO games (game, data) VALUES (?, ?);', [body.game, body.data], err => {
      if (err) {
        res.sendStatus(500);
        throw(err);
      }
    });
    res.sendStatus(200);
  });
});

app.post('/api/v0/user_auth', (req, res) => {
  console.log('/api/v0/user_auth: got request: ',  req.body);
  db.serialize(() => {
    console.log(req.body);
    let body = req.body;
      db.all('SELECT nick, passwd FROM users WHERE nick = ?', [body.nick], (err, entries) => {
        console.log(entries);
        console.log(entries.length);
        if (err) {
          res.sendStatus(500);
          throw(err);
        } else {
          if (entries.length > 0) {
            if (bcrypt.compareSync(body.passwd, entries[0].passwd)) {
              res.sendStatus(200);
            } else {
              res.sendStatus(401);
            }
          } else {
            console.log("sent 401");
            res.sendStatus(401);
          }
        }
      });
  });
});

app.use('/', router);

app.listen(port);

console.log('Listening on port ' + port);
