import Layout from "../components/Layout";
import { useContext, useEffect, useState, createContext, useRef } from "react";

export default function Home() {
  const [ws, setWs] = useState(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isRecordingState, setIsRecordingState] = useState(false);

  const isRecording = useRef(false);
  const canvasRef = useRef(null);
  const points = useRef([]);

  const setIsRecording = (value) => {
    isRecording.current = value;
    setIsRecordingState(value);
  };

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3001");
    setWs(ws);

    ws.onopen = () => {
      console.log("Connected to the server");
      setIsConnected(true);
    };

    ws.onmessage = (evt) => {
      if (evt.data === "startRecording") {
        setIsRecording(true);
        points.current = [];
      }

      if (evt.data === "stopRecording") {
        setIsRecording(false);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from the server");
      setIsConnected(false);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // get coords of upper left corner of canvas
    const rect = canvas.getBoundingClientRect();

    const addPoint = (x, y) => {
      // get timestamp
      const timestamp = Date.now();
      points.current.push({ x, y, alpha: 1.0, time: timestamp });
    };

    const draw = () => {
      context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
      context.beginPath();

      for (let i = points.current.length - 1; i >= 0; i--) {
        const point = points.current[i];
        context.strokeStyle = `rgba(0, 0, 255, ${point.alpha})`;
        if (i === 0) {
          context.moveTo(point.x, point.y);
        } else {
          context.lineTo(point.x, point.y);
        }
      }

      context.stroke();
      requestAnimationFrame(draw); // Request to draw the next frame
    };

    draw();

    canvas.addEventListener("mousemove", (event) => {
      if (!isRecording.current) {
        return;
      }

      // only add point if mouse is inside the canvas
      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        // translate the mouse coordinates to canvas coordinates
        const x = (event.clientX - rect.left) * 2;
        const y = (event.clientY - rect.top) * 2;
        addPoint(x, y);
      }
    });

    return () => {
      canvas.removeEventListener("mousemove", addPoint);
    };
  }, []);

  return (
    <Layout title={"experiment"}>
      <div>
        <h1 className="text-center text-3xl font-bold">
          CRM Listening Experiment
        </h1>

        <div className="flex justify-center items-center w-1/2 m-auto">
          <canvas
            ref={canvasRef}
            style={{ width: "100%", height: "100%" }}
            className="border-2 border-black"
          ></canvas>
        </div>

        <div className="flex flex-col justify-center items-center">
          <span>
            Connection Status: {isConnected ? "Connected" : "Disconnected"}
          </span>
          <span>
            Recording Status: {isRecordingState ? "Recording" : "Not Recording"}
          </span>
        </div>
      </div>
    </Layout>
  );
}
