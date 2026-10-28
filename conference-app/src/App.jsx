// make sure to update navbar here as well when adding new pages
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Sessions from "./pages/Sessions";
import Cart from "./pages/Cart";
import Register from "./pages/Register";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}