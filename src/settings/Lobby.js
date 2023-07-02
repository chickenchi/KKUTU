import "./style/Lobby.scss";
import Section from "./Section";

function startGame() {
  window.location = "./Game";
}

function Lobby() {
  const room = [];

  return (
    <div className="Lobby">
      <div>{room}1</div>
    </div>
  );
}

export default Lobby;
