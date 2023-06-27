import "./style/Game.scss";
import Data from "./Data.js";
import React, { useState, useEffect } from "react";
import Audio from "../Audio";
import Audio2 from "../Audio2";
import Audio3 from "../Audio3";
import Audio4 from "../Audio4";
import BGM from "../AudioBGM";
import AudioStart from "../AudioStart";
import { getWordData } from "./wordData";
import Firebase from "../Firebase";

var wordStack = [];

var turn = "Player";

let isPlayWord = false;
let typeGrant = true;

const activeAudio = (sfxName) => {
  const SFX = document.getElementById(sfxName);
  SFX.pause();
  SFX.currentTime = 0;
  SFX.volume = 0.5;
  var playPromise = SFX.play();
  if (playPromise !== undefined) {
    playPromise.then((_) => {}).catch((error) => {});
  }
};

function Game() {
  const [data] = useState(Data);
  const [playerScore, changePS] = useState("00000");
  const [aiScore, changePSI] = useState("00000");
  const [usedTime, changeUsedTime] = useState(0);
  const [syllable, syllableChange] = useState("대기 중입니다.");

  var Changed;

  window.onbeforeunload = function (e) {
    return 0;
  };

  document.addEventListener("paste", function (event) {
    event.preventDefault();
  });

  useEffect(() => {
    Changed = document.getElementById("Changed");

    alert(Changed.innerHTML);

    pro();
  }, [Changed]);

  async function pro() {
    while (Changed.innerHTML === "0") await timer(100);
    Changed.innerHTML = "0";
    activeAudio("Start");
    selected();

    document.getElementById("type").style.display = "none";

    setTimeout(() => {
      activeAudio("BGM");
      document.getElementById("type").style.display = "";
      document.getElementById("type").focus();
      timeProgress();
    }, 3000);
  }

  const showWrongDisplay = (typeOfWrong, wroteType) => {
    typeGrant = false;

    const text = document.getElementById("text");

    setTimeout(() => {
      text.style.color = "white";
      text.style.textDecoration = "none";

      if (typeOfWrong === "used")
        text.innerHTML = "이미 쓰인 단어: " + wroteType;
      else text.innerHTML = wroteType;

      text.style.color = "red";
      text.style.textDecoration = "line-through";
    }, 0);

    setTimeout(() => {
      text.style.color = "red";
      text.style.textDecoration = "none";
    }, 1000);

    setTimeout(() => {
      text.style.color = "red";
      text.style.textDecoration = "line-through";
    }, 1500);

    setTimeout(() => {
      text.style.color = "red";
      text.style.textDecoration = "none";
    }, 2000);

    setTimeout(() => {
      typeGrant = true;
      text.style.color = "white";
      text.style.textDecoration = "none";
      text.innerHTML = syllable;
    }, 2500);
  };

  const getRandom = (maxValue) => {
    return Math.floor(Math.random() * maxValue);
  };

  let exist = false;

  const aiStart = (front) => {
    let setWord = "";
    let compareData = "";
    let text = document.getElementById("text");
    let i = 0;
    let pointing = 0;

    console.log();

    try {
      do {
        for (i = 0; i < arr[0]["word"].length; i++) {
          arr = getWordData();

          compareData = arr[0]["word"][i]["에콜드파리"];

          if (
            compareData.charAt(0) === front &&
            compareData.length >= 2 &&
            wordStack.indexOf(compareData) === -1
          ) {
            if (getRandom(10) === 5) {
              setWord = compareData;
              pointing = 0;
              break;
            } else pointing = 1;
          }
        }
        if (pointing === 0 && setWord === "") throw "noWord";
      } while (pointing === 1);
    } catch (err) {
      activeAudio("Wrong");
      showWrongDisplay("noMatchWord", front + "... T.T");
      return;
    }

    scoreSetting(setWord);

    let max = setWord.length;
    let fulltime = 1500;
    let setDelayTime = 1500;
    let isFluid = false;
    let fluidList = [];
    let fluidStack = 0;

    if (max === 2 || max === 8) {
      setDelayTime = 1500;
      isFluid = false;
    } else if (max === 3) {
      setDelayTime = 1750;
      isFluid = false;
    } else if (max === 4) {
      let template = [900, 1950, 900, 1550];
      setDelayTime = template[0];
      fluidList = template;
      fulltime = 1650;
      isFluid = true;
    } else if (max === 5) {
      let template = [800, 800, 1900, 800, 1900];
      setDelayTime = template[0];
      fluidList = template;
      fulltime = 1650;
      isFluid = true;
    } else if (max === 6) {
      let template = [1170, 1170, 2170, 1170, 1170, 1170];
      setDelayTime = template[0];
      fluidList = template;
      fulltime = 1700;
      isFluid = true;
    } else if (max === 7) {
      let template = [1300, 1300, 2550, 1300, 1300, 1300, 1300];
      setDelayTime = template[0];
      fluidList = template;
      fulltime = 1650;
      isFluid = true;
    }

    animated = 1;

    try {
      showWord(
        setWord,
        isFluid,
        fulltime,
        text,
        setWord,
        max,
        setDelayTime,
        fluidStack,
        fluidList
      );
    } catch (err) {}
  };

  const selected = () => {
    while (exist === false) {
      let rand1 = getRandom(398);
      let rand2 = getRandom(27);
      var sel = data.sets[rand1].a[rand2];

      let i = 0;

      try {
        for (i; ; i++) {
          arr = getWordData();
          let compareData = arr[0]["word"][i]["에콜드파리"];

          if (
            compareData.charAt(0) === sel.charAt(0) &&
            compareData.length >= 2
          ) {
            exist = true;
            break;
          }
        }
      } catch (err) {}
    }

    syllableChange(sel);
  };

  var animated = 0;

  let arr;

  const timer = (ms) => new Promise((res) => setTimeout(res, ms));

  const minusScore = () => {
    let pSc = document.getElementById("playerScore").innerHTML;
    let aiSc = document.getElementById("aiScore").innerHTML;

    if (turn === "Player") {
      let playerSC = parseInt(pSc) - 100;

      if (playerSC < 0) playerSC = "00000";
      else playerSC += "";

      while (playerSC.length < 5) {
        playerSC = "0" + playerSC;
      }

      changePS(playerSC);
    } else {
      let aiSC = parseInt(aiSc) - 100;

      if (aiSC < 0) aiSC = "00000";
      else aiSC += "";

      while (aiSC.length < 5) {
        aiSC = "0" + aiSC;
      }

      changePSI(aiSC);
    }
  };

  async function timeProgress() {
    let timeProgressBar = document.getElementById("timebar");
    let tpbWidth = 94; // 94
    let text = document.getElementById("text").innerHTML;

    timeProgressBar.style.width = tpbWidth + "%";

    while (tpbWidth > 0) {
      if (isPlayWord === false) tpbWidth -= 0.08;
      timeProgressBar.style.width = tpbWidth + "%";
      changeUsedTime(tpbWidth);
      await timer(41);
    }

    wordStack.length = 0;

    isPlayWord = false;

    changeUsedTime(tpbWidth);

    minusScore();

    exist = false;

    selected();

    document.getElementById("BGM").pause();

    activeAudio("Start");

    document.getElementById("type").style.display = "none";

    setTimeout(() => {
      activeAudio("BGM");
      if (turn === "Player") {
        document.getElementById("type").style.display = "";
        document.getElementById("type").focus();
      } else aiStart(text);

      timeProgress();
    }, 3000);
  }

  const showWord = (
    type,
    isFluid,
    fulltime,
    text,
    typeboy,
    max,
    setDelayTime,
    fluidStack,
    fluidList
  ) => {
    isPlayWord = true;

    document.getElementById("type").style.display = "none";
    let typeLength = turn === "Player" ? type.value.length : type.length;
    turn = turn === "Player" ? "AI" : "Player";

    for (let i = 0; i <= typeLength; i++) {
      if (isFluid === false) {
        if (i === typeLength) {
          setTimeout(() => {
            activeAudio("KungKung");
          }, (fulltime / typeLength) * i);

          setTimeout(() => {
            animated = 0;

            syllableChange("");
            isPlayWord = false;

            setTimeout(() => {
              syllableChange(typeboy.charAt(i - 1));
            }, 0);

            setTimeout(() => {
              if (turn === "Player") {
                document.getElementById("type").style.display = "";
                document.getElementById("type").focus();
              } else aiStart(typeboy.charAt(i - 1));
            }, 10);
          }, (fulltime / typeLength) * i + 1500);
        } else if (i >= 29) {
          i = max - 1;

          setTimeout(() => {
            text.innerHTML += "...";
          }, (setDelayTime / typeLength) * (i - 3));
        } else {
          setTimeout(() => {
            if (max < 29 || (max >= 29 && i === 0))
              activeAudio(max <= 8 ? "TypeSound" : "TypeSoundPower");
            if ((turn === "Player" && i !== 0) || turn === "AI")
              text.innerHTML += typeboy.charAt(i);
          }, (setDelayTime / typeLength) * i);
        }
      } else {
        fluidStack += fluidList[i] / typeLength;
        if (i === typeLength) {
          setTimeout(() => {
            activeAudio("KungKung");
          }, (fulltime / typeLength) * i);

          setTimeout(() => {
            animated = 0;

            syllableChange("");
            setTimeout(() => {
              syllableChange(typeboy.charAt(i - 1));
            }, 0);

            isPlayWord = false;

            setTimeout(() => {
              if (turn === "Player") {
                document.getElementById("type").style.display = "";
                document.getElementById("type").focus();
              } else aiStart(typeboy.charAt(i - 1));
            }, 10);
          }, (fulltime / typeLength) * i + 1500);
        } else {
          setTimeout(() => {
            activeAudio(max <= 8 ? "TypeSound" : "TypeSoundPower");
            if ((turn === "Player" && i !== 0) || turn === "AI")
              text.innerHTML += typeboy.charAt(i);
          }, fluidStack);
        }
      }
    }
  };

  const scoreSetting = (typeboy) => {
    if (turn === "Player") {
      let rateScore = (
        2 *
        Math.pow(5 + 7 * typeboy.length, 0.74) *
        (1 - (94 - parseInt(usedTime)) / 10 / 136)
      ).toFixed(0);

      if (rateScore < 0) rateScore = 0;

      let playerSC = parseInt(playerScore) + parseInt(rateScore) + "";

      while (playerSC.length < 5) {
        playerSC = "0" + playerSC;
      }

      changePS(playerSC);

      wordStack.push(typeboy);
    } else {
      let rateScore = (
        2 *
        Math.pow(5 + 7 * typeboy.length, 0.74) *
        (1 - 94 / 10 / 136)
      ).toFixed(0);

      if (rateScore < 0) rateScore = 0;

      let aiSC = parseInt(aiScore) + parseInt(rateScore) + "";

      while (aiSC.length < 5) {
        aiSC = "0" + aiSC;
      }

      changePSI(aiSC);

      wordStack.push(typeboy);
    }
  };

  const handleOnKeyPress = (e) => {
    if (e.ctrlKey && e.keyCode === 86) e.returnValue = false;

    let text = document.getElementById("text");
    let type = document.getElementById("type");
    let typeboy = type.value;

    let i = 0;
    let compareData = "";

    if (e.key === "Enter" && animated === 0 && typeGrant === true) {
      if (typeboy.charAt(0) === syllable && typeboy.length >= 2) {
        // wordisTrue

        document.getElementById("text").style.color = "white";
        document.getElementById("text").style.textDecoration = "none";

        try {
          if (wordStack.indexOf(typeboy) !== -1) throw "used";
          for (i; ; i++) {
            arr = getWordData();
            compareData = arr[0]["word"][i]["에콜드파리"];

            if (compareData === typeboy) break;
          }
        } catch (err) {
          activeAudio("Wrong");

          if (err === "used") showWrongDisplay("used", typeboy);
          else showWrongDisplay("noMatchWord", typeboy);

          type.value = "";
          return;
        }

        scoreSetting(typeboy);

        let max = type.value.length;
        let fulltime = 1500;
        let setDelayTime = 1500;
        let isFluid = false;
        let fluidList = [];
        let fluidStack = 0;

        if (max === 2 || max === 8) {
          setDelayTime = 1500;
          isFluid = false;
        } else if (max === 3) {
          setDelayTime = 1750;
          isFluid = false;
        } else if (max === 4) {
          let template = [900, 1950, 900, 1550];
          setDelayTime = template[0];
          fluidList = template;
          fulltime = 1650;
          isFluid = true;
        } else if (max === 5) {
          let template = [800, 800, 1900, 800, 1900];
          setDelayTime = template[0];
          fluidList = template;
          fulltime = 1650;
          isFluid = true;
        } else if (max === 6) {
          let template = [1170, 1170, 2170, 1170, 1170, 1170];
          setDelayTime = template[0];
          fluidList = template;
          fulltime = 1700;
          isFluid = true;
        } else if (max === 7) {
          let template = [1300, 1300, 2550, 1300, 1300, 1300, 1300];
          setDelayTime = template[0];
          fluidList = template;
          fulltime = 1650;
          isFluid = true;
        }

        animated = 1;
        text.innerHTML = "";

        try {
          showWord(
            type,
            isFluid,
            fulltime,
            text,
            typeboy,
            max,
            setDelayTime,
            fluidStack,
            fluidList
          );
        } catch (err) {}
      } else if (typeboy.length < 2) {
      } else {
        activeAudio("Wrong");
        type.value = "";
        return;
      }

      type.value = "";
    }
  };

  return (
    <div className="Game">
      <div className="audioWorkspace">
        <Audio />
        <Audio2 />
        <Audio3 />
        <Audio4 />
        <AudioStart />
        <BGM />
      </div>
      <div className="firebaseWorkspace">
        <Firebase />
      </div>
      <div className="word">
        <p id="text" className="text">
          {syllable}
        </p>
        <div className="Timebar"></div>
        <div id="timebar" className="InTimebar"></div>
      </div>
      <input
        type="text"
        id="type"
        className="typing"
        placeholder="당신의 차례입니다! 단어를 입력하세요(붙여넣기 기능을 사용할 수 없습니다)."
        onKeyPress={handleOnKeyPress}
      />
      <div className="playerspace">
        <div className="me">
          <div className="player">
            <img className="image" alt="player" src="./images/kkutu_bot.png" />
            <p className="name">Player</p>
            <p id="playerScore" className="score">
              {playerScore}
            </p>
          </div>
        </div>
        <div className="ai">
          <div className="player">
            <img
              className="image"
              alt="kkutu_bot"
              src="./images/kkutu_bot.png"
            />
            <p className="name">사기 끄투 봇</p>
            <p id="aiScore" className="score">
              {aiScore}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Game;
