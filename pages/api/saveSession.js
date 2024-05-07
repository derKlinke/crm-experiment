// pages/api/saveSession.js
import sqlite3 from "sqlite3";

export default function handler(req, res) {
  if (req.method === "POST") {
    const db = new sqlite3.Database(
      "./sessionData.sqlite3",
      sqlite3.OPEN_READWRITE,
      (err) => {
        if (err) {
          console.error(err.message);
          res.status(500).json({ error: err.message });
          return;
        }
        console.log("Connected to the mydb.sqlite database.");
      }
    );

    const pointsJSON = JSON.stringify(req.body);
    const query = `INSERT INTO sessions (points) VALUES (?)`;

    db.run(query, pointsJSON, function (err) {
      db.close();
      if (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
      } else {
        res
          .status(200)
          .json({ message: "Data saved successfully", id: this.lastID });
      }
    });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
