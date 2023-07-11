import React, { Component } from "react";
import music from "./Music/SFX/Died.mp3";

function Audio5() {
  return (
    <div className="Audio">
      <audio src={music} id="Died" volume="0.5" />
    </div>
  );
}

export default Audio5;
