import React, { Component } from "react";
import music from "./Music/SFX/TypeSoundPower.mp3";

function Audio3() {
  return (
    <div className="Audio">
      <audio src={music} id="TypeSoundPower" />
    </div>
  );
}

export default Audio3;
