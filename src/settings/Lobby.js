import "./style/Lobby.scss";

function startGame() {
  window.location = "./Game";
}

function Lobby() {
  return (
    <div className="Lobby">
      <button className="StartBtn" onClick={startGame}>
        게임 시작
      </button>
    </div>
  );
}

export default Lobby;
