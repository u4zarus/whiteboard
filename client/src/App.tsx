import { Route, Routes } from "react-router-dom";
import Join from "./pages/Join";
import Whiteboard from "./pages/Whiteboard";
import "./App.css";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Join />} />
            <Route path="/room/:roomId" element={<Whiteboard />} />
        </Routes>
    );
}

export default App;
