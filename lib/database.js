const sqlite3 = require("sqlite3").verbose();

let db = new sqlite3.Database("./sessionData.sqlite3", (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Connected to the sessionData.sqlite database.");
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        points TEXT
    )`);
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log("Close the database connection.");
});
