import json
import logging as log
import sqlite3
from logging.config import dictConfig

import matplotlib
import matplotlib.pyplot as plt
import pandas as pd
from flask import Flask, jsonify, request, send_file
from flask_cors import CORS

matplotlib.use("Agg")  # Set the backend to 'Agg' to avoid displaying the plot in a window

app = Flask(__name__)
CORS(app, origins="*")

num_sessions = 0

db_path = "store/sessionData.sqlite3"

dictConfig({
    'version': 1,
    'formatters': {'default': {
        'format': '[%(asctime)s] %(levelname)s: %(message)s',
    }},
    'handlers': {'wsgi': {
        'class': 'logging.StreamHandler',
        'formatter': 'default'
    }},
    'root': {
        'level': 'DEBUG',
        'handlers': ['wsgi']
    }
})


def create_table():
    db = sqlite3.connect(db_path)
    cursor = db.cursor()

    cursor.execute(
        "CREATE TABLE IF NOT EXISTS sessions (id INTEGER PRIMARY KEY, points TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    )
    db.commit()
    db.close()

    log.info("Table created successfully")


@app.route("/api/deleteAllSessions", methods=["POST"])
def delete_all_sessions():
    try:
        db = sqlite3.connect(db_path)
        cursor = db.cursor()

        cursor.execute("DELETE FROM sessions")
        db.commit()
        return jsonify({"message": "All sessions deleted successfully"}), 200
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Failed to delete data"}), 500
    finally:
        if db:
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

        log.debug(f"Retrieved {len(result)} sessions from the database")

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

    log.debug(f"Retrieved {len(data)} sessions from the database")

    # when there are no sessions, return an empty plot
    if not data:
        return jsonify({"error": "Failed to fetch data"}), 500

    # Check if the number of sessions has changed, if not return the same plot
    if num_sessions == len(data):
        log.info("Returning the same plot")
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
    fig, axs = plt.subplots(2, sharex=True, figsize=(10, 6))  # Create two subplots sharing x axis

    # Plot 'x' values on the first subplot
    axs[0].plot(grouped_data["time"], grouped_data["x"], label="Average X")
    axs[0].set_ylabel("Average X")
    axs[0].set_ylim(-1, 1)
    axs[0].legend()
    axs[0].grid(True)

    # Plot 'y' values on the second subplot
    axs[1].plot(grouped_data["time"], grouped_data["y"], label="Average Y", color='orange')
    axs[1].set_xlabel("Time")
    axs[1].set_ylabel("Average Y")
    axs[1].set_ylim(-1, 1)
    axs[1].legend()
    axs[1].grid(True)

    plt.suptitle("Average X and Y Values Over Time")  # Set a title for the entire figure

    plt.savefig("plot.png")
    plt.close()

    log.info("Plot generated successfully")

    return send_file("plot.png", mimetype="image/png")


@app.route("/api/saveSession", methods=["POST"])
def save_session():
    try:
        db = sqlite3.connect(db_path)
        cursor = db.cursor()
        points = request.json  # Directly use the parsed JSON from the request body

        log.debug(f"Received {len(points)} points from the client")

        if not points:
            log.error("Invalid data, empty points")
            return jsonify({"error": "Invalid data, empty points"}), 400

        if 'time' not in points[0]:
            log.error("Invalid data, 'time' key not found")
            return jsonify({"error": "Invalid data, 'time' key not found"}), 400

        df = pd.DataFrame(points)
        df['time'] = pd.to_datetime(df['time'], unit='ms')

        # Convert x and y values from [0, 1] to [-1, 1] and invert x values
        df['x'] = (df['x'] - 0.5) * 2
        df['y'] = (1 - df['y'] - 0.5) * 2

        # Resample the DataFrame to 1-second intervals and calculate the mean of 'x' and 'y' values in each interval
        resampled_df = df.resample('100L', on='time').mean().reset_index()
        resampled_df = resampled_df.fillna(method='ffill')

        # Convert the resampled DataFrame back to a JSON string
        points_json = resampled_df.to_json(orient='records')

        query = "INSERT INTO sessions (points) VALUES (?)"
        cursor.execute(query, (points_json,))
        db.commit()

        log.debug(f"Successfully saved {len(resampled_df)} points to the database")

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
