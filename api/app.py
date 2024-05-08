from flask import Flask, jsonify, request, send_file
import json
import sqlite3
from flask_cors import CORS
import matplotlib.pyplot as plt
import matplotlib

matplotlib.use("Agg")

import pandas as pd

app = Flask(__name__)
CORS(app)

num_sessions = 0

db_path = "store/sessionData.sqlite3"


def create_table():
    db = sqlite3.connect(db_path)
    cursor = db.cursor()

    cursor.execute(
        "CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY, points TEXT)"
    )
    db.commit()
    db.close()


@app.route("/api/getSessions", methods=["GET"])
def get_sessions():
    try:
        db = sqlite3.connect(db_path)
        cursor = db.cursor()

        # Execute query to fetch all sessions
        cursor.execute("SELECT * FROM sessions")
        rows = cursor.fetchall()

        # Convert query results to a list of dicts
        columns = [column[0] for column in cursor.description]
        result = [dict(zip(columns, row)) for row in rows]

        return jsonify(result), 200
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500
    finally:
        if db:
            db.close()  # Ensure connection is closed


@app.route("/api/getSessions/plot", methods=["GET"])
def get_sessions_plot():
    # Execute query to fetch all sessions
    db = sqlite3.connect(db_path)
    cursor = db.cursor()

    cursor.execute("SELECT * FROM sessions")
    data = cursor.fetchall()

    # Convert query results to a list of dicts
    columns = [column[0] for column in cursor.description]
    data = [dict(zip(columns, row)) for row in data]

    # Check if the number of sessions has changed, if not return the same plot
    if num_sessions == len(data):
        return send_file("plot.png", mimetype="image/png")

    all_points = []
    for entry in data:
        # Decode the nested JSON string in 'points'
        points = json.loads(entry["points"])
        # Add an 'id' field to each point and append to the list
        for point in points:
            point["id"] = entry["id"]
            all_points.append(point)

    # Convert list of dictionaries to DataFrame
    df = pd.DataFrame(all_points)

    # Aggregate data by 'time' and compute average for 'x' and 'y'
    grouped_data = df.groupby("time").agg({"x": "mean", "y": "mean"}).reset_index()

    # Plotting
    plt.figure(figsize=(10, 6))
    plt.plot(grouped_data["time"], grouped_data["x"], label="Average X")
    plt.plot(grouped_data["time"], grouped_data["y"], label="Average Y")
    plt.xlabel("Time")
    plt.ylabel("Average Value")
    plt.title("Average X and Y Values Over Time")
    plt.legend()
    plt.grid(True)

    plt.savefig("plot.png")
    plt.close()

    return send_file("plot.png", mimetype="image/png")


@app.route("/api/saveSession", methods=["POST"])
def save_session():
    try:
        db = sqlite3.connect(db_path)
        cursor = db.cursor()

        # Extract JSON data from the request
        points = request.json  # Directly use the parsed JSON from the request body
        points_json = json.dumps(points)  # Convert Python dict/list to a JSON string

        # Prepare SQL query to insert data
        query = "INSERT INTO sessions (points) VALUES (?)"
        cursor.execute(query, (points_json,))
        db.commit()

        last_id = cursor.lastrowid
        return jsonify({"message": "Data saved successfully", "id": last_id}), 200
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to fetch data"}), 500
    finally:
        if db:
            db.close()  # Ensure connection is closed


if __name__ == "__main__":
    create_table()

    import waitress

    waitress.serve(app, host="0.0.0.0", port=5000)
    print("Server running...")
