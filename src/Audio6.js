import React, { Component } from "react";
import music from "./Music/SFX/Mission.mp3";

function Audio6() {
  return (
    <div className="Audio">
      <audio src={music} id="Mission" volume="0.5" />
    </div>
  );
}

export default Audio6;
