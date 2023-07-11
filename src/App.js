import Header from "./settings/Header";
import Footer from "./settings/Footer";
import Section from "./settings/Section";
import Lobby from "./settings/Lobby";
import { Routes, Route, BrowserRouter } from "react-router-dom";

function App() {
  return (
    <BrowserRouter basename="/KKUTU">
      <Header />
      <Routes>
        <Route path="/" element={<Section />}></Route>
        <Route path="/Game" element={<Lobby />}></Route>
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
