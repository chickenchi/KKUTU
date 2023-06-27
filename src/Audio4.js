import React, { Component } from "react";
import music from "./Music/SFX/KungKung.mp3";

function Audio2() {
  return (
    <div className="Audio">
      <audio src={music} id="KungKung" volume="0.5" />
    </div>
  );
}

export default Audio2;
