import { BrowserRouter, Routes, Route } from "react-router-dom";
import Form from "./pages/Form";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Form />} />
        <Route path="/form" element={<Form />} />
      </Routes>
    </BrowserRouter>
  );
}
