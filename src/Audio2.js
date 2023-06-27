import React, { Component } from "react";
import music from "./Music/SFX/TypeSound.mp3";

function Audio2() {
  return (
    <div className="Audio">
      <audio src={music} id="TypeSound" />
    </div>
  );
}

export default Audio2;
