import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

const roomDrawings: Record<string, Array<any>> = {};

io.on("connection", (socket) => {
    console.log("a user connected:", socket.id);

    socket.on("join-room", ({ roomId, nickname }) => {
        socket.join(roomId);
        socket.data.nickname = nickname;
        socket.data.roomId = roomId;

        socket.emit("init-drawings", roomDrawings[roomId] || []);

        console.log(`user ${nickname} joined room ${roomId}`);
    });

    socket.on("drawing", (data) => {
        const roomId = socket.data.roomId;
        if (!roomId) return;

        if (!roomDrawings[roomId]) {
            roomDrawings[roomId] = [];
        }
        roomDrawings[roomId].push(data);

        socket.to(roomId).emit("drawing", data);
    });

    socket.on("cursor", (position) => {
        const room = socket.data.roomId;
        socket
            .to(room)
            .emit("cursor", { position, nickname: socket.data.nickname });
    });

    socket.on("disconnect", () => {
        console.log(`user ${socket.data.nickname} disconnected`);
    });
});

const PORT = 3000;

httpServer.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});
