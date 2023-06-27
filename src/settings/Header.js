function lobby() {
  window.location = "/";
}

function Header() {
  return (
    <div className="Header">
      <h1 onClick={lobby}>KKUTU</h1>
    </div>
  );
}

export default Header;
