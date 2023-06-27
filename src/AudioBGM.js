import React, { Component } from "react";
import music from "./Music/BGM/Game.mp3";

function Audio2() {
  return (
    <div className="Audio">
      <audio src={music} id="BGM" />
    </div>
  );
}

export default Audio2;
