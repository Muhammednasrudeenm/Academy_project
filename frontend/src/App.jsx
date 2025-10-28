import { BrowserRouter, Routes, Route } from "react-router-dom";
import Form from "./pages/Form";
import Available_Communities from "./pages/Available_Communities";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Available_Communities />} />
        <Route path="/form" element={<Form />} />
        <Route path="/communities" element={<Available_Communities />} />

      </Routes>
    </BrowserRouter>
  );
}
