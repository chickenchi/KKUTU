import Header from "./settings/Header";
import Footer from "./settings/Footer";
import Section from "./settings/Section";
import Lobby from "./settings/Lobby";
import { Routes, Route, BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter basename={process.env.PUBLIC_URL}>
      <Header />
      <Routes>
        <Route path="/Game" element={<Lobby />}></Route>
        <Route path="/" element={<Section />}></Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
