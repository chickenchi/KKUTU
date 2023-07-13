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

let isAvailable = false;
let isPlayWord = false;
let typeGrant = true;

let round = 6;
let currentRound = 4; // 기본값: 0
let roundChecked = false;
let rankChecked = false;
let userCount = 2; // 멀티로 만들 거면 이렇게 하면 안 됨

const Lobby = () => {
  window.location = "/KKUTU";
};

const showRound = () => {
  if (roundChecked) return;
  roundChecked = false;

  let shRound = [];

  for (var i = 1; i <= round; i++) {
    let p = "round-ico " + i;
    shRound.push(<div id={p}>{i}</div>);
  }
  return shRound;
};

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

const offAudio = (sfxName) => {
  const SFX = document.getElementById(sfxName);
  SFX.pause();
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
  const [gameOver, gO] = useState(false);

  var Changed;

  window.onbeforeunload = function (e) {
    return 0;
  };

  document.addEventListener("paste", function (event) {
    event.preventDefault();
  });

  const resultScreen = () => {
    syllableChange("게임 끝!");
    document.getElementById("type").style.display = "none";
    offAudio("BGM");

    setTimeout(() => {
      document.getElementById("resultScreen").style.display = "flex";
    }, 2000);
  };

  const nextRound = () => {
    currentRound++;

    if (round < currentRound) {
      resultScreen();
      return true;
    }

    for (var i = 1; i <= round; i++) {
      document.getElementById("round-ico " + i).style.backgroundColor =
        "rgb(255, 172, 233)";
    }
    let mainCol = document.getElementById("round-ico " + currentRound);

    mainCol.style.backgroundColor = "rgb(255, 77, 181)";

    return false;
  };

  const moveContainer = (e) => {
    const resScr = document.getElementById("resultScreen");

    let shiftX = e.clientX - resScr.getBoundingClientRect().left + 6;
    let shiftY = e.clientY - resScr.getBoundingClientRect().top + 161;

    e.target.style.position = "absolute";
    e.target.style.zIndex = 1000;

    moveAt(e.pageX, e.pageY);

    function moveAt(pageX, pageY) {
      resScr.style.left = pageX - shiftX + "px";
      resScr.style.top = pageY - shiftY + "px";
    }

    function onMouseMove(event) {
      moveAt(event.pageX, event.pageY);

      e.target.hidden = true;
      let elemBelow = document.elementFromPoint(event.clientX, event.clientY);
      e.target.hidden = false;

      if (!elemBelow) return;
    }

    document.addEventListener("mousemove", onMouseMove);

    resScr.onmouseup = function () {
      document.removeEventListener("mousemove", onMouseMove);
      resScr.onmouseup = null;
    };
  };

  useEffect(() => {
    document.getElementById("type").style.display = "none";
    Changed = document.getElementById("Changed");
    randMission();

    const resScr = document.getElementById("resultScreen");

    //resScr.addEventListener("mousedown", moveContainer);

    resScr.ondragstart = function () {
      return false;
    };

    for (var i = 1; i <= round; i++) {
      document.getElementById("round-ico " + i).style.marginLeft = "7px";
      document.getElementById("round-ico " + i).style.borderRadius = "30px";
      document.getElementById("round-ico " + i).style.backgroundColor =
        "rgb(255, 172, 233)";
      document.getElementById("round-ico " + i).style.width = "45px";
      document.getElementById("round-ico " + i).style.height = "30px";
      document.getElementById("round-ico " + i).style.fontSize = "14pt";
      document.getElementById("round-ico " + i).style.display = "flex";
      document.getElementById("round-ico " + i).style.alignItems = "center";
      document.getElementById("round-ico " + i).style.justifyContent = "center";
      document.getElementById("round-ico " + i).style.border =
        "2px solid white";
    }

    pro();
  }, [Changed]);

  async function pro() {
    while (Changed.innerHTML === "0") await timer(100);
    Changed.innerHTML = "0";
    activeAudio("Start");

    nextRound();

    selected();

    document.getElementById("type").style.display = "";

    setTimeout(() => {
      isAvailable = true;
      activeAudio("BGM");
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

        insertData = arr[0]["word"][i]["거울에비친빛의신좌"];

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
          let compareData = arr[0]["word"][i]["거울에비친빛의신좌"];

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
    let minusPoint = 0;
    let useRate = 0;

    for (let i = 0; i < wordStack.length; i++) useRate += wordStack[i].length;

    minusPoint = 200 + 16 * wordStack.length + useRate;

    if (turn === "Player") {
      let playerSC = parseInt(pSc) - minusPoint;

      if (playerSC < 0) playerSC = "00000";
      else playerSC += "";

      while (playerSC.length < 5) {
        playerSC = "0" + playerSC;
      }

      changePS(playerSC);
    } else {
      let aiSC = parseInt(aiSc) - minusPoint;

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
    let tpbWidth = 24; //

    timeProgressBar.style.width = tpbWidth + "%";

    while (tpbWidth > 0) {
      if (isPlayWord === false) tpbWidth -= 0.08;
      timeProgressBar.style.width = tpbWidth + "%";
      changeUsedTime(tpbWidth);
      await timer(41);
    }

    activeAudio("Died");

    isAvailable = false;
    minusScore();

    setTimeout(() => {
      const startCode = () => {
        setTimeout(() => {
          isAvailable = true;

          activeAudio("BGM");
          if (turn === "Player") {
            document.getElementById("type").focus();
          } else aiStart();

          timeProgress();
        }, 3000);
      };

      const readyCode = () => {
        wordStack.length = 0;

        isPlayWord = false;

        changeUsedTime(tpbWidth);

        exist = false;

        selected();

        document.getElementById("BGM").pause();

        activeAudio("Start");

        startCode();
      };

      let isGameOver = nextRound();

      gO(isGameOver);

      if (!isGameOver) readyCode();
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
    fluidList,
    missionChr
  ) => {
    isPlayWord = true;

    let typeLength = turn === "Player" ? type.value.length : type.length;
    isAvailable = false;
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
              isAvailable = true;
              if (turn === "Player") {
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
              isAvailable = true;
              if (turn === "Player") {
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

    if (
      e.key === "Enter" &&
      animated === 0 &&
      typeGrant === true &&
      turn === "Player" &&
      isAvailable === true
    ) {
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
            compareData = arr[0]["word"][i]["거울에비친빛의신좌"];

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

  const showRank = () => {
    if (roundChecked) return;
    roundChecked = false;

    let shRank = [];
    let rankList = ["", "st", "nd", "rd", "th", "th", "th", "th", "th"];

    let userList = ["Player", "AI"];
    let userScore = [parseInt(playerScore), parseInt(aiScore)];
    let userRank = [1, 2];

    // ai와 player에 한해 코드 가동 가능
    if (userScore[0] < userScore[1]) {
      let chg = userScore[1];
      userScore[1] = userScore[0];
      userScore[0] = chg;

      let chgN = userList[1];
      userList[1] = userList[0];
      userList[0] = chgN;
    } else if (userScore[0] === userScore[1]) {
      userRank[0] = 1;
      userRank[1] = 1;
    }

    for (var i = 0; i < userCount; i++) {
      let rnk = "rank-" + (i + 1);
      let nme = "name-" + (i + 1);
      let scr = "score-" + (i + 1);

      shRank.push(
        <div className="Listing">
          <div id={rnk}>{userRank[i] + rankList[userRank[i]]}</div>
          <div id={nme}>{userList[i]}</div>
          <div id={scr}>{userScore[i]}</div>
        </div>
      );
    }
    return shRank;
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
      <div className="round">{showRound()}</div>
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
        placeholder="(붙여넣기 기능을 사용할 수 없습니다)"
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
      <div className="resultScreen" id="resultScreen">
        <div className="title">
          <span className="title-text">게임 결과📍</span>
        </div>
        <div className="note">
          <span className="rank">랭킹</span>
          <span className="player">유저</span>
          <span className="score">점수</span>
        </div>
        <div className="list">{gameOver && showRank()}</div>
        <button className="quit-button" onClick={Lobby}>
          확인
        </button>
      </div>
    </div>
  );
}

export default Game;
