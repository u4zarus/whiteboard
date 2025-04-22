import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const colors = ["#000000", "#e63946", "#2a9d8f", "#f4a261", "#264653"];

interface Stroke {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
    color: string;
    penWidth: number;
}

const Whiteboard = () => {
    const { roomId } = useParams();

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState(colors[0]);
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
    const [penWidth, setPenWidth] = useState(2);

    const nickname = localStorage.getItem("nickname") || "Guest";
    const lastPos = useRef<{ x: number; y: number } | null>(null);

    const drawLine = (
        x0: number,
        y0: number,
        x1: number,
        y1: number,
        color: string,
        width: number = 2
    ) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        context.strokeStyle = color;
        context.lineWidth = width;
        context.lineCap = "round";
        context.lineJoin = "round";
        context.beginPath();
        context.moveTo(x0, y0);
        context.lineTo(x1, y1);
        context.stroke();
        context.closePath();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d");
        if (!context) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        context.lineCap = "round";
        context.lineWidth = penWidth;

        setCtx(context);
    }, []);

    useEffect(() => {
        if (!roomId) return;

        socket.emit("join-room", { roomId, nickname });

        socket.on("drawing", ({ x0, y0, x1, y1, color, penWidth }) => {
            drawLine(x0, y0, x1, y1, color, penWidth);
        });

        socket.on("init-drawings", (strokes: Stroke[]) => {
            strokes.forEach(({ x0, y0, x1, y1, color, penWidth }) => {
                drawLine(x0, y0, x1, y1, color, penWidth);
            });
        });

        return () => {
            socket.off("drawing");
            socket.off("init-drawings");
        };
    }, [roomId, nickname]);

    const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x: 0, y: 0 };

        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!ctx) return;

        const pos = getCanvasPos(e);
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.strokeStyle = color;

        lastPos.current = pos;
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !ctx || !lastPos.current) return;

        const newPos = getCanvasPos(e);
        ctx.lineTo(newPos.x, newPos.y);
        ctx.stroke();

        socket.emit("drawing", {
            x0: lastPos.current.x,
            y0: lastPos.current.y,
            x1: newPos.x,
            y1: newPos.y,
            color,
            penWidth,
        });

        lastPos.current = newPos;
    };

    const stopDrawing = () => {
        if (!ctx) return;

        ctx.closePath();
        setIsDrawing(false);
        lastPos.current = null;
    };

    return (
        <div>
            {/* Canvas */}
            <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="absolute top-0 left-0"
            />

            {/* Color Picker */}
            <div className="fixed top-4 left-4 bg-white p-2 rounded shadow flex gap-2 z-10">
                {colors.map((c) => (
                    <button
                        key={c}
                        onClick={() => setColor(c)}
                        style={{
                            backgroundColor: c,
                            border:
                                c === color
                                    ? "2px solid black"
                                    : "1px solid #ccc",
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                        }}
                    />
                ))}
            </div>

            {/* Pen Width Selector */}
            <div className="fixed top-24 left-4 bg-white p-2 rounded shadow flex items-center gap-2 z-10">
                <label htmlFor="pen-width" className="text-sm text-gray-700">
                    🖊 Width
                </label>
                <input
                    id="pen-width"
                    type="range"
                    min={1}
                    max={10}
                    value={penWidth}
                    onChange={(e) => {
                        const width = parseInt(e.target.value);
                        setPenWidth(width);
                        if (ctx) ctx.lineWidth = width;
                    }}
                    className="w-24"
                />
                <span className="text-sm w-6 text-center">{penWidth}</span>
            </div>

            {/* Nickname */}
            <div className="fixed top-4 right-4 bg-white px-4 py-2 shadow rounded z-10">
                <span className="text-gray-700">👤 {nickname}</span>
            </div>
        </div>
    );
};

export default Whiteboard;
