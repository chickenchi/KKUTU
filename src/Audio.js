import React, { Component } from "react";
import music from "./Music/SFX/Wrong.mp3";

function Audio() {
  return (
    <div className="Audio">
      <audio src={music} id="Wrong" />
    </div>
  );
}

export default Audio;
