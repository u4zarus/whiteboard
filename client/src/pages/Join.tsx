import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Generates a random 5-character uppercase room code.
 * @returns {string} - The generated room code.
 */
const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 7).toUpperCase();
};

/**
 * Join component.
 *
 * This component allows a user to join an existing whiteboard room or create a new one.
 * It includes input fields for the user's nickname and room code. When a user enters
 * these details, they can join the specified room. The component also provides an
 * option to generate a new room code if the user wants to create a new room.
 * The nickname and room code are stored in the local storage and the user is navigated
 * to the room page upon successful submission.
 */
const Join = () => {
    const [nickname, setNickname] = useState("");
    const [roomCode, setRoomCode] = useState("");
    const navigate = useNavigate();

    /**
     * Handles the form submission for joining a room.
     * Prevents the default form behavior, checks if both nickname and roomCode are provided,
     * stores the nickname in local storage, and navigates to the specified room.
     * @param {React.FormEvent} e - The form event.
     */
    const handleJoin = (e: React.FormEvent) => {
        e.preventDefault();
        if (nickname && roomCode) {
            localStorage.setItem("nickname", nickname);
            navigate(`/room/${roomCode}`);
        }
    };

    /**
     * Generates a new room code and sets the room code state to the new value.
     * This is used when a user wants to create a new room.
     */
    const handleCreateRoom = () => {
        const newRoom = generateRoomCode();
        setRoomCode(newRoom);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
            <div className="w-full max-w-md p-6 bg-white rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
                    Join a Whiteboard
                </h1>
                <form onSubmit={handleJoin} className="flex flex-col gap-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            Nickname
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                            Room Code
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. ABC123"
                            value={roomCode}
                            onChange={(e) =>
                                setRoomCode(e.target.value.toUpperCase())
                            }
                            className="w-full border border-gray-300 px-4 py-2 rounded-lg uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={6}
                            required
                        />
                    </div>
                    <div className="flex justify-between gap-2 mt-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                            Join Room
                        </button>
                        <button
                            type="button"
                            onClick={handleCreateRoom}
                            className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                        >
                            Create New Room
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Join;
