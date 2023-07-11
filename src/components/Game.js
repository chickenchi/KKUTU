import "./style/Game.scss";
import Data from "./Data.js";
import React, { useState, useEffect } from "react";
import Audio from "../Audio";
import Audio2 from "../Audio2";
import Audio3 from "../Audio3";
import Audio4 from "../Audio4";
import Audio5 from "../Audio5";
import Audio6 from "../Audio6";
import BGM from "../AudioBGM";
import AudioStart from "../AudioStart";
import { getWordData } from "./wordData";
import Firebase from "../Firebase";
import imgA from "../images/kkutu_bot.png";

var wordStack = [];

var turn = "Player";

let isPlayWord = false;
let typeGrant = true;

const activeAudio = (sfxName) => {
  const SFX = document.getElementById(sfxName);
  SFX.pause();
  SFX.currentTime = 0;
  if (sfxName === "BGM") SFX.volume = 0.1;
  else SFX.volume = 0.5;
  var playPromise = SFX.play();
  if (playPromise !== undefined) {
    playPromise.then((_) => {}).catch((error) => {});
  }
};

function getDoumChar(lastChar) {
  let data = lastChar.charCodeAt() - 0xac00;
  if (data < 0 || data > 11171) return;

  const RIEUL_TO_NIEUN = [4449, 4450, 4457, 4460, 4462, 4467];
  const RIEUL_TO_IEUNG = [4451, 4455, 4456, 4461, 4466, 4469];
  const NIEUN_TO_IEUNG = [4455, 4461, 4466, 4469];

  let onset = Math.floor(data / 28 / 21) + 0x1100,
    nucleus = (Math.floor(data / 28) % 21) + 0x1161,
    coda = (data % 28) + 0x11a7,
    isDoumChar = false,
    doumChar;

  if (onset == 4357) {
    isDoumChar = true;
    RIEUL_TO_NIEUN.indexOf(nucleus) != -1
      ? (onset = 4354)
      : RIEUL_TO_IEUNG.indexOf(nucleus) != -1
      ? (onset = 4363)
      : (isDoumChar = false);
  } else if (onset == 4354) {
    if (NIEUN_TO_IEUNG.indexOf(nucleus) != -1) {
      onset = 4363;
      isDoumChar = true;
    }
  }
  if (isDoumChar) {
    onset -= 0x1100;
    nucleus -= 0x1161;
    coda -= 0x11a7;
    doumChar = String.fromCharCode((onset * 21 + nucleus) * 28 + coda + 0xac00);
  }

  return doumChar;
}

function Game() {
  const [data] = useState(Data);
  const [playerScore, changePS] = useState("00000");
  const [aiScore, changePSI] = useState("00000");
  const [usedTime, changeUsedTime] = useState(0);
  const [syllable, syllableChange] = useState("대기 중입니다.");
  const [mText, mtChange] = useState("가");

  var Changed;

  window.onbeforeunload = function (e) {
    return 0;
  };

  document.addEventListener("paste", function (event) {
    event.preventDefault();
  });

  useEffect(() => {
    document.getElementById("type").style.display = "none";
    Changed = document.getElementById("Changed");
    randMission();

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
      if (typeOfWrong === "aiNoMatchWord") {
        if (getDoumChar(wroteType.charAt(0)) === undefined)
          text.innerHTML = wroteType.charAt(0);
        else
          text.innerHTML =
            wroteType.charAt(0) + "(" + getDoumChar(wroteType.charAt(0)) + ")";
      } else {
        if (getDoumChar(syllable.charAt(0)) === undefined)
          text.innerHTML = syllable.charAt(0);
        else
          text.innerHTML =
            syllable.charAt(0) + "(" + getDoumChar(syllable.charAt(0)) + ")";
      }
    }, 2500);
  };

  const getRandom = (maxValue) => {
    return Math.floor(Math.random() * maxValue);
  };

  let exist = false;

  const aiStart = () => {
    let setWord = "";
    let insertData = "";
    let i = 0;
    let useStack = [];
    let text = document.getElementById("text");
    let front = document.getElementById("text").innerHTML;
    front = front.charAt(0);

    try {
      for (i = 0; i < arr[0]["word"].length; i++) {
        arr = getWordData();

        insertData = arr[0]["word"][i]["에콜드파리"];

        if (
          (insertData.charAt(0) === front ||
            insertData.charAt(0) === getDoumChar(front)) &&
          insertData.length >= 2 &&
          wordStack.indexOf(insertData) === -1
        ) {
          useStack.push(insertData);
        }
      }
      if (useStack.length === 0) throw "noWord";

      useStack.sort(function (a, b) {
        return b.length - a.length;
      });

      for (let i = 0; i < useStack.length; i++) {
        console.log(useStack);
      }

      setWord = useStack[0];
      text.innerHTML = setWord.charAt(0);
    } catch (err) {
      activeAudio("Wrong");
      showWrongDisplay("aiNoMatchWord", front + "... T.T");
      return;
    }

    let missionChr = document.getElementById("mission").innerHTML;
    let max = setWord.length;
    let fulltime = 1500;
    let setDelayTime = 1500;
    let isFluid = false;
    let fluidList = [];
    let fluidStack = 0;

    scoreSetting(setWord);

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
        fluidList,
        missionChr
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

    if (getDoumChar(sel) !== undefined)
      syllableChange(sel + "(" + getDoumChar(sel) + ")");
    else syllableChange(sel);
  };

  var animated = 0;

  let arr;

  const timer = (ms) => new Promise((res) => setTimeout(res, ms));

  const minusScore = () => {
    let pSc = document.getElementById("playerScore").innerHTML;
    let aiSc = document.getElementById("aiScore").innerHTML;

    if (turn === "Player") {
      let playerSC = parseInt(pSc) - (20 + 6 * wordStack.length);

      if (playerSC < 0) playerSC = "00000";
      else playerSC += "";

      while (playerSC.length < 5) {
        playerSC = "0" + playerSC;
      }

      changePS(playerSC);
    } else {
      let aiSC = parseInt(aiSc) - (20 + 6 * wordStack.length);

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
    let tpbWidth = 94;

    timeProgressBar.style.width = tpbWidth + "%";

    while (tpbWidth > 0) {
      if (isPlayWord === false) tpbWidth -= 0.08;
      timeProgressBar.style.width = tpbWidth + "%";
      changeUsedTime(tpbWidth);
      await timer(41);
    }

    activeAudio("Died");

    minusScore();

    document.getElementById("type").style.display = "none";

    setTimeout(() => {
      wordStack.length = 0;

      isPlayWord = false;

      changeUsedTime(tpbWidth);

      exist = false;

      selected();

      document.getElementById("BGM").pause();

      activeAudio("Start");
    }, 3000);

    setTimeout(() => {
      activeAudio("BGM");
      if (turn === "Player") {
        document.getElementById("type").style.display = "";
        document.getElementById("type").focus();
      } else aiStart();

      timeProgress();
    }, 6000);
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
    fluidList,
    missionChr
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
              if (getDoumChar(typeboy.charAt(i - 1)) !== undefined)
                syllableChange(
                  typeboy.charAt(i - 1) +
                    "(" +
                    getDoumChar(typeboy.charAt(i - 1)) +
                    ")"
                );
              else syllableChange(typeboy.charAt(i - 1));
            }, 0);

            setTimeout(() => {
              if (turn === "Player") {
                document.getElementById("type").style.display = "";
                document.getElementById("type").focus();
              } else aiStart();
            }, 10);
          }, (fulltime / typeLength) * i + 1500);
        } else if (i >= 18) {
          i = max - 1;

          setTimeout(() => {
            text.innerHTML += "...";
          }, (setDelayTime / typeLength) * (i - 3));
        } else {
          setTimeout(() => {
            let isMission = typeboy.charAt(i) === missionChr;

            if (max < 23 || (max >= 23 && i === 0))
              activeAudio(
                isMission
                  ? "Mission"
                  : max <= 8
                  ? "TypeSound"
                  : "TypeSoundPower"
              );

            if ((turn === "Player" && i !== 0) || turn === "AI") {
              let showChr = isMission
                ? `<span style="color:lightgreen">` +
                  typeboy.charAt(i) +
                  `</span>`
                : typeboy.charAt(i);
              text.innerHTML += showChr;
            }
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
              if (getDoumChar(typeboy.charAt(i - 1)) !== undefined)
                syllableChange(
                  typeboy.charAt(i - 1) +
                    "(" +
                    getDoumChar(typeboy.charAt(i - 1)) +
                    ")"
                );
              else syllableChange(typeboy.charAt(i - 1));
            }, 0);

            isPlayWord = false;

            setTimeout(() => {
              if (turn === "Player") {
                document.getElementById("type").style.display = "";
                document.getElementById("type").focus();
              } else aiStart();
            }, 10);
          }, (fulltime / typeLength) * i + 1500);
        } else {
          setTimeout(() => {
            let isMission = typeboy.charAt(i) === missionChr;

            activeAudio(
              isMission ? "Mission" : max <= 8 ? "TypeSound" : "TypeSoundPower"
            );
            if ((turn === "Player" && i !== 0) || turn === "AI") {
              let showChr = isMission
                ? `<span style="color:lightgreen">` +
                  typeboy.charAt(i) +
                  `</span>`
                : typeboy.charAt(i);
              text.innerHTML += showChr;
            }
          }, fluidStack);
        }
      }
    }
  };

  const randMission = () => {
    let missionList = [
      "가",
      "나",
      "다",
      "라",
      "마",
      "바",
      "사",
      "아",
      "자",
      "차",
      "카",
      "타",
      "파",
      "하",
    ];

    mtChange(missionList[getRandom(14)]);
  };

  const scoreSetting = (typeboy) => {
    var text = typeboy;
    var count = 0;
    var searchChar = document.getElementById("mission").innerHTML;
    var pos = text.indexOf(searchChar);

    while (pos !== -1) {
      count++;
      pos = text.indexOf(searchChar, pos + 1);
    }

    if (count > 0) randMission();

    let rateScore = (
      2 *
      Math.pow(5 + 7 * typeboy.length, 0.74) *
      (1 - 94 / 10 / 136) *
      (1 + 2 * count)
    ).toFixed(0);

    if (rateScore < 0) rateScore = 0;

    if (turn === "Player") {
      let playerSC = parseInt(playerScore) + parseInt(rateScore) + "";

      while (playerSC.length < 5) {
        playerSC = "0" + playerSC;
      }

      changePS(playerSC);

      wordStack.push(typeboy);
    } else {
      let aiSc = document.getElementById("aiScore").innerHTML;

      let aiSC = parseInt(aiSc) + parseInt(rateScore) + "";

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
      if (
        (typeboy.charAt(0) === syllable.charAt(0) ||
          typeboy.charAt(0) === getDoumChar(syllable.charAt(0))) &&
        typeboy.length >= 2
      ) {
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

        let missionChr = document.getElementById("mission").innerHTML;
        let max = type.value.length;
        let fulltime = 1500;
        let setDelayTime = 1500;
        let isFluid = false;
        let fluidList = [];
        let fluidStack = 0;

        scoreSetting(typeboy);

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
            fluidList,
            missionChr
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
        <Audio5 />
        <Audio6 />
        <AudioStart />
        <BGM />
      </div>
      <div className="firebaseWorkspace">
        <Firebase />
      </div>
      <div className="mission">
        <p className="mission-text">mission</p>
        <p id="mission" className="mission-a">
          {mText}
        </p>
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
            <img className="image" alt="player" src={imgA} />
            <p className="name">Player</p>
            <p id="playerScore" className="score">
              {playerScore}
            </p>
          </div>
        </div>
        <div className="ai">
          <div className="player">
            <img className="image" alt="kkutu_bot" src={imgA} />
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
