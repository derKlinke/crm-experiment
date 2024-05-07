import Layout from "../components/Layout";
import Image from "next/image";

import { useEffect, useState } from "react";

export default function Admin() {
  const [ws, setWs] = useState(null);

  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection
    const ws = new WebSocket("ws://localhost:3001");
    setWs(ws);

    ws.onmessage = (event) => {
      if (event.data === "pong") {
        console.log("Pong received");
      }

      if (event.data === "startRecording") {
        console.log("Recording started");
        setIsRecording(true);
      }
    };

    ws.onopen = () => {
      console.log("Connected to the server");
      setIsConnected(true);
    };

    ws.onclose = (code, reason) => {
      setIsConnected(false);
      console.log(
        "Disconnected from the server with code:",
        code,
        "reason:",
        reason
      );
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }, []);

  const startRecording = () => {
    if (ws) {
      ws.send(JSON.stringify({ action: "startRecording" }));
    }

    // play a audio file
    const audio = new Audio("/song1.mp3");
    audio.play();

    // detect when the audio file ends
    audio.addEventListener("ended", () => {
      console.log("Audio file ended");
      ws.send(JSON.stringify({ action: "stopRecording" }));
    });
  };

  return (
    <Layout title={"admin"}>
      <div className="flex flex-col justify-center items-center min-h-[80vh]">
        <Image
          src="/song1.png"
          width={200}
          height={200}
          alt="logo"
          className="m-10"
        />
        <button
          onClick={startRecording}
          className="bg-highlight font-bold p-2 rounded-lg"
        >
          Start Recording
        </button>
      </div>
      <div className="flex flex-col justify-center items-center">
        <span>
          Connection Status: {isConnected ? "Connected" : "Disconnected"}
        </span>
        <span>
          Recording Status: {isRecording ? "Recording" : "Not Recording"}
        </span>
      </div>
    </Layout>
  );
}
