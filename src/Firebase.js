import { useEffect, useState, useRef } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import wordData, { updateWordData } from "./components/wordData";
import { starting } from "./components/Game";

const firebaseConfig = {
  apiKey: "AIzaSyCvP4e0WebZ_6KEPsS8NAABKhPrvmJDoXs",
  authDomain: "kkutu-1da8e.firebaseapp.com",
  projectId: "kkutu-1da8e",
  storageBucket: "kkutu-1da8e.appspot.com",
  messagingSenderId: "11519741380",
  appId: "1:11519741380:web:7a9cf83149618df5516891",
  measurementId: "G-BPH4MLSG9K",
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

function Firebase() {
  const [data, setData] = useState(null);
  const formData = new FormData();
  const [showedResult, chgR] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await database.ref().once("value");
      const value = snapshot.val();
      let word = [{ word: value }];
      updateWordData(word);
      setData(value);
      console.log("구성 완료.");
      chgR(1);
    };

    fetchData();
  }, []);

  return <div id="Changed">{showedResult}</div>;
}

export default Firebase;
