import "./style/Lobby.scss";

function startGame() {
  window.location = "./Game";
}

function Lobby() {
  const room = [];

  return (
    <div className="Lobby">
      <div>{room}1</div>
      <button className="StartBtn" onClick={startGame}>
        게임 시작
      </button>
    </div>
  );
}

export default Lobby;
