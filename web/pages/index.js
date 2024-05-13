import Layout from "../components/Layout";
import {useEffect, useRef, useState} from "react";


export default function Home() {
    const [isConnected, setIsConnected] = useState(false);
    const [isRecordingState, setIsRecordingState] = useState(false);

    const isRecording = useRef(false);
    const canvasRef = useRef(null);
    const points = useRef([]);
    const startTime = useRef(null);

    const setIsRecording = (value) => {
        isRecording.current = value;
        setIsRecordingState(value);
    };

    console.log("Base URL:", process.env.NEXT_PUBLIC_BASE_URL);

    useEffect(() => {
        const ws = new WebSocket(`ws://${process.env.NEXT_PUBLIC_BASE_URL}:3001`);

        ws.onopen = () => {
            console.log("Connected to the server");
            setIsConnected(true);
        };

        ws.onmessage = (evt) => {
            if (evt.data === "startRecording") {
                setIsRecording(true);
                points.current = [];
                startTime.current = Date.now();
            }

            if (evt.data === "stopRecording") {
                setIsRecording(false);

                // store the points in the database
                fetch(`http://${process.env.NEXT_PUBLIC_BASE_URL}:5000/api/saveSession`, {
                    method: "POST", headers: {
                        "Content-Type": "application/json",
                    }, body: JSON.stringify(points.current),
                })
                    .then((response) => response.json())
                    .then((data) => console.log(data))
                    .catch((error) => console.error("Error:", error));
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
            // get timestamp offset by starting time, so we have a relative timestamp
            const timestamp = Date.now() - startTime.current;

            // normalize x and y to the range [0, 1] relative to the size of the canvas
            const normalizedX = x / canvasRef.current.width;
            const normalizedY = y / canvasRef.current.height;

            points.current.push({x: normalizedX, y: normalizedY, time: timestamp});
        };

        const draw = () => {
            context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
            context.beginPath();
            context.lineWidth = 4;
            context.lineCap = "round";
            context.strokeStyle = "blue";

            for (let i = points.current.length - 1; i >= 0; i--) {
                const point = points.current[i];
                context.strokeStyle = `rgba(0, 0, 255, ${point.alpha})`;

                // Convert normalized coordinates back to canvas coordinates
                const canvasX = point.x * canvasRef.current.width;
                const canvasY = point.y * canvasRef.current.height;

                if (i === 0) {
                    context.moveTo(canvasX, canvasY);
                } else {
                    context.lineTo(canvasX, canvasY);
                }
            }

            context.stroke();

            const axes = canvas.getContext("2d");
            // draw axes for reference
            axes.beginPath();
            axes.strokeStyle = "gray";
            axes.lineWidth = 1;
            axes.moveTo(0, canvas.height / 2);
            axes.lineTo(canvas.width, canvas.height / 2);
            axes.moveTo(canvas.width / 2, 0);
            axes.lineTo(canvas.width / 2, canvas.height);
            axes.stroke();

            requestAnimationFrame(draw); // Request to draw the next frame
        };

        draw();

        const handleMove = (event) => {
            if (!isRecording.current) {
                return;
            }

            event.preventDefault();

            let x, y;
            if (event.touches) { // Check if this is a touch event
                x = event.touches[0].clientX - rect.left;
                y = event.touches[0].clientY - rect.top;
            } else { // If not a touch event, it's a mouse event
                x = event.clientX - rect.left;
                y = event.clientY - rect.top;
            }

            if (x >= 0 && x <= canvas.width && y >= 0 && y <= canvas.height) {
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                x = x * scaleX;
                y = y * scaleY;
                addPoint(x, y);
            }
        };

        canvas.addEventListener("mousemove", handleMove);
        canvas.addEventListener("touchmove", handleMove);


        return () => {
            canvas.removeEventListener("mousemove", handleMove);
            canvas.removeEventListener("touchmove", handleMove);
        };
    }, []);

    return (
        <Layout title={"experiment"}>
            <div>
                <div className="flex flex-col" style={{height: 'calc(100dvh - 45px)'}}>
                    <h1 className="text-center text-3xl font-bold">
                        CRM Listening Experiment
                    </h1>

                    <div className="flex-grow relative h-0 md:w-1/2 mx-auto container">
                        <canvas
                            ref={canvasRef}
                            className="absolute top-0 left-0 w-full h-full border-2 border-black"
                        ></canvas>
                        <div
                            className="absolute top-1/2 right-0 transform -translate-x-1/2 -translate-y-7 text-lg">
                            Valence
                        </div>
                        <div
                            className="absolute top-0 left-1/2 translate-y-10 -translate-x-6 transform text-lg rotate-90">
                            Arousal
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center items-center text-sm">
                    <span>Connection Status: {isConnected ? "Connected" : "Disconnected"}</span>
                    <span>Recording Status: {isRecordingState ? "Recording" : "Not Recording"}</span>
                </div>
            </div>
        </Layout>
    );
}
