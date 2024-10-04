import React, { useEffect, useRef, useState } from "react";
import { Link, Navigate, json, useNavigate } from "react-router-dom";
import logo from "./../../public/logo3.jpg";
import mainlogo from "./../../public/logo.jpg";
import axios from "axios";
import Loading from "./Loading";
import Dropdown from "react-dropdown";
import "react-dropdown/style.css";
import wavs from "../../public/wavs.gif";
import wait from "../../public/wait.gif";
import "./dropdown.css";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import {
  animate,
  circIn,
  circInOut,
  circOut,
  easeIn,
  easeInOut,
  easeOut,
  motion,
} from "framer-motion";
import { useAnimate, stagger } from "framer-motion";
import { Bounce, Expo, Power4, Sine } from "gsap/all";
import { Circ } from "gsap/all";
import toast, { Toaster } from "react-hot-toast";
import { data } from "autoprefixer";

const Home = () => {
  let navigate = useNavigate();
  const [home, sethome] = useState(null);
  const [language, setlanguage] = useState("hindi");
  const [details, setdetails] = useState([]);
  const [songlink, setsonglink] = useState([]);
  const [like, setlike] = useState(false);
  var [index, setindex] = useState("");
  var [page, setpage] = useState(1);
  var [page2, setpage2] = useState(Math.floor(Math.random() * 50));
  const audioRef = useRef();
  const [audiocheck, setaudiocheck] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const options = [
    "hindi",
    "english",
    "punjabi",
    "tamil",
    "telugu",
    "marathi",
    "gujarati",
    "bengali",
    "kannada",
    "bhojpuri",
    "malayalam",
    "urdu",
    "haryanvi",
    "rajasthani",
    "odia",
    "assamese",
  ];

  const Gethome = async () => {
    detailsseter();
    try {
      const { data } = await axios.get(
        `https://jiosaavan-harsh-patel.vercel.app/modules?language=${language}`
      );
      sethome(data.data);
    } catch (error) {
      console.log("error", error);
    }
  };
  const Getdetails = async () => {
    try {
      const { data } = await axios.get(
        `https://jiosaavan-api-2-harsh-patel.vercel.app/api/search/songs?query=${language}&page=${
          language === "english" ? page : page2
        }&limit=20`
      );

      console.log(data);

      const newData = data.data.results.filter(
        (newItem) => !details.some((prevItem) => prevItem.id === newItem.id)
      );

      setdetails((prevState) => [...prevState, ...newData]);
    } catch (error) {
      console.log("error", error);
    }
  };
  const [forceRender, setForceRender] = useState(false);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        const audio = audioRef.current;
        if (audio.paused) {
          audio.play();
          setaudiocheck(true);
        } else {
          audio.pause();
          setaudiocheck(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.code === "ArrowUp" ||
        e.code === "ArrowDown" ||
        e.code === "ArrowLeft" ||
        e.code === "ArrowRight"
      ) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function audioseter(i) {
    if (songlink[0]?.id === details[i].id) {
      const audio = audioRef.current;
      if (!audio.paused) {
        audio.pause();
        setaudiocheck(false);
      } else {
        setaudiocheck(true);
        audio.play().catch((error) => {
          console.error("Playback failed:", error);
        });
      }
    } else {
      setindex(i);
      setsonglink([details[i]]);
    }
  }

  function likeset(e) {
    var tf =
      localStorage.getItem("likeData") &&
      JSON.parse(localStorage.getItem("likeData")).some(
        (item) => item.id == e?.id
      );

    setlike(tf);
  }

  function likehandle(i) {
    let existingData = localStorage.getItem("likeData");

    let updatedData = [];

    if (existingData) {
      updatedData = JSON.parse(existingData);
    }

    let exists = updatedData.some((item) => item.id === i.id);

    if (!exists) {
      updatedData.push(i);
      localStorage.setItem("likeData", JSON.stringify(updatedData));
      setlike(true);
    } else {
      setlike(false);
      let existingData = localStorage.getItem("likeData");

      if (!existingData) {
        console.log("No data found in localStorage.");
        return;
      }

      let updatedData = JSON.parse(existingData);

      const indexToRemove = updatedData.findIndex((item) => item.id === i.id);

      if (indexToRemove !== -1) {
        updatedData.splice(indexToRemove, 1);

        localStorage.setItem("likeData", JSON.stringify(updatedData));
      }
    }
  }
  const initializeMediaSession = () => {
    const isIOS = /(iPhone|iPod|iPad)/i.test(navigator.userAgent);

    if (!isIOS && "mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: songlink[0]?.name || "",
        artist: songlink[0]?.album?.name || "",
        artwork: [
          {
            src: songlink[0]?.image[2]?.url || "",
            sizes: "512x512",
            type: "image/jpeg",
          },
        ],
      });

      navigator.mediaSession.setActionHandler("play", function () {
        // Handle play action
        if (audioRef.current) {
          audioRef.current.play().catch((error) => {
            console.error("Play error:", error);
          });
        }
      });

      navigator.mediaSession.setActionHandler("pause", function () {
        // Handle pause action
        if (audioRef.current) {
          audioRef.current.pause().catch((error) => {
            console.error("Pause error:", error);
          });
        }
      });

      navigator.mediaSession.setActionHandler("previoustrack", function () {
        pre();
      });

      navigator.mediaSession.setActionHandler("nexttrack", function () {
        next();
      });
    } else {
      console.warn("MediaSession API is not supported or the device is iOS.");
    }
  };

  function next() {
    if (index < details.length - 1) {
      setindex(index++);
      audioseter(index);
    } else {
      setindex(0);
      setsonglink([details[0]]);
    }
  }
  function pre() {
    if (index > 0) {
      setindex(index--);
      audioseter(index);
    } else {
      setindex(details.length - 1);
      setsonglink([details[details.length - 1]]);
    }
  }

  const handleVolumeChange = (e) => {
    const value = e.target.value;
    audioRef.current.volume = value;

    // Set the dynamic gradient for the volume bar
    e.target.style.background = `linear-gradient(to right, #0ff50f 0%, #0ff50f ${
      value * 100
    }%, #ccc ${value * 100}%, #ccc 100%)`;
  };

  function detailsseter() {
    setpage(1);
    setindex("");
    setsonglink([]);
    setdetails([]);
  }

  function seccall() {
    const intervalId = setInterval(() => {
      if (home === null) {
        Getartists();
      }
    }, 1000);
    return intervalId;
  }
  function seccall2() {
    const intervalId2 = setInterval(
      () => {
        if (details.length >= 0 && page < 20) {
          setpage2(Math.floor(Math.random() * 50));
          setpage(page + 1);
          Getdetails();
        }
      },
      page <= 2 ? 500 : 2000
    );
    return intervalId2;
  }

  useEffect(() => {
    var interval = seccall();

    return () => clearInterval(interval);
  }, [language, home]);

  useEffect(() => {
    Gethome();
  }, [language]);

  useEffect(() => {
    var interval2 = seccall2();

    return () => clearInterval(interval2);
  }, [details, page, language]);

  useEffect(() => {
    likeset(songlink[0]);
  }, [songlink]);

  useEffect(() => {
    const isIOS = /(iPhone|iPod|iPad)/i.test(navigator.userAgent);

    if (!isIOS && songlink.length > 0) {
      audioRef.current.play();
      initializeMediaSession();
    }
  }, [songlink]);

  var title = songlink[0]?.name;

  document.title = `${title ? title : "Nekron Music"}`;

  return details.length > 0 ? (
    <div className="w-full h-screen">
      <motion.div className="logo fixed z-[99] top-0 w-full duration-700 max-h-[12vh] flex backdrop-blur-xl py-3 px-10 sm:px-5 sm:justify-center items-center gap-3 bg-[#121111] justify-between">
        <div className="flex sm:hidden items-center sm:justify-center sm:pt-2 gap-3">
          <img className="w-[15vw] sm:w-[10vw]" src={mainlogo} alt="" />
        </div>
        <motion.div className="sm:flex sm:pt-3 text-white mx-2 sm:mx-0 flex gap-3">
          <Link
            className=" text-xl sm:text-sm ml-3 sm:ml-0 sm:font-bold  p-1 rounded-md hover:text-[#0fea0f]  text-white  font-semibold "
            to={"/songs"}
          >
            Songs
          </Link>

          <Link
            className="  text-xl sm:text-sm ml-3 sm:ml-0 sm:font-bold  p-1 rounded-md hover:text-[#0fea0f] text-white  font-semibold "
            to={"/playlist"}
          >
            PlayLists
          </Link>
          <Link
            className="  text-xl sm:text-sm ml-3 sm:ml-0 sm:font-bold  p-1 rounded-md hover:text-[#0fea0f]  text-white  font-semibold"
            to={"/artists"}
          >
            Artists
          </Link>
          <Link
            className="  text-xl sm:text-sm ml-3 sm:ml-0 sm:font-bold  p-1 rounded-md hover:text-[#0fea0f]  text-white  font-semibold "
            to={"/album"}
          >
            Album
          </Link>
          <Link
            className=" text-xl sm:text-sm ml-3 sm:ml-0 sm:font-bold  p-1 rounded-md hover:text-[#0fea0f]  text-white  font-semibold"
            to={"/likes"}
          >
            Likes
          </Link>
        </motion.div>
      </motion.div>

      <div className="w-full bg-black pt-[30vh] text-white flex flex-col gap-5 overflow-x-auto overflow-hidden no-scrollbar">
      <div className="flex items-center gap-4">
          {options.map((langOption, index) => (
            <button
              key={index}
              className={`text-xl sm:text-sm ml-3 sm:ml-0 sm:font-bold rounded-[0.15rem] px-4 hover:text-[#0fea0f] capitalize bg-[#131212] p-3 ${
                language === langOption ? "text-[#0ff50f]" : "text-white"
              }`}
              onClick={() => setlanguage(langOption)}
            >
              {langOption}
            </button>
          ))}
        </div>
      </div>
      
      <div className="w-full  bg-black  min-h-[63vh] pb-[30vh]  text-white p-5 flex flex-col gap-5 overflow-auto ">
        <div className="trending songs flex flex-col gap-3 w-full ">
          <h3 className="text-4xl h-[5vh] font-bold text-[#0ff50f] capitalize ">
            {language} <span className="text-white">Songs</span>
          </h3>
          <motion.div className="songs px-8 sm:px-5 py-6 flex gap-6 overflow-x-auto overflow-hidden w-full no-scrollbar ">
            {details?.map((t, i) => (
              <motion.div
                onClick={() => audioseter(i)}
                key={i}
                whileHover={{
                  scale: 1.1,
                  boxShadow: "0 10px 15px rgba(0, 255, 15, 0.2)",
                }}
                className="flex-shrink-0 w-[20%] sm:w-[40%] p-5 bg-[#1e1e1e] rounded-lg cursor-pointer flex flex-col items-center justify-center hover:bg-[#2c2c2c] transition-all duration-300 shadow-md group relative"
              >
                <motion.div className="w-[12vw] sm:w-[25vw] h-[12vw] sm:h-[25vw] rounded-md overflow-hidden flex items-center justify-center mb-4">
                  <motion.img
                    src={t.image[2].url}
                    alt={t.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.div>

                <motion.div className="flex flex-col items-center text-center">
                  <p
                    className={`text-white text-xl sm:text-md font-bold ${
                      i === index && "text-[#0ff50f]"
                    } leading-tight`}
                  >
                    {t.name.length > 20
                      ? t.name
                          .slice(0, 20)
                          .trim()
                          .replace(/[\s\(\[\{]*$/, "") + "..."
                      : t.name}
                  </p>
                  <p className="text-gray-400 text-sm sm:text-xs mt-1">
                    {t.album.name.length > 20
                      ? t.album.name
                          .slice(0, 20)
                          .trim()
                          .replace(/[\s\(\[\{]*$/, "") + "..."
                      : t.album.name}
                  </p>
                </motion.div>

                {songlink.length > 0 && (
                  <i
                    className={`absolute top-2 right-2 text-4xl text-[#0ff50f] ${
                      t.id === songlink[0]?.id ? "block" : "hidden"
                    } ${
                      audiocheck
                        ? "ri-pause-circle-fill"
                        : "ri-play-circle-fill"
                    }`}
                  ></i>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
        <div className="charts w-full flex flex-col gap-3   ">
          <h3 className="text-4xl h-[5vh] font-bold text-[#0ff50f] capitalize">
            Charts
          </h3>
          <div className="chartsdata px-8 sm:px-5 py-6 flex gap-6 overflow-x-auto w-full no-scrollbar">
            {home?.charts?.map((c, i) => (
              <motion.div
                onClick={() =>
                  navigate(`/playlist/details/${c.id}`, {
                    state: {
                      image: c.image[2]?.link,
                      name: c.title,
                    },
                  })
                }
                key={i}
                whileHover={{
                  scale: 1.1,
                  boxShadow: "0 10px 15px rgba(0, 255, 15, 0.2)",
                }}
                className="flex-shrink-0 w-[15%] sm:w-[40%] p-5 bg-[#1e1e1e] rounded-lg cursor-pointer flex flex-col items-center justify-center hover:bg-[#2c2c2c] transition-all duration-300 shadow-md group"
              >
                <motion.div className="w-[8vw] sm:w-[20vw] h-[8vw] sm:h-[20vw] rounded-md overflow-hidden flex items-center justify-center mb-4">
                  <motion.img
                    src={c.image[2].link}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.div>
                <motion.h3 className="leading-none">
                  <p className="text-white text-xl sm:text-md font-bold">
                    {c.title.length > 15
                      ? c.title
                          .slice(0, 15)
                          .trim()
                          .replace(/[\s\(\[\{]*$/, "") + "..."
                      : c.title}
                  </p>
                </motion.h3>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="playlists w-full  flex flex-col gap-3 ">
          <h3 className="text-4xl h-[5vh] font-bold text-[#0ff50f] capitalize">
            Playlists
          </h3>
          <div className="playlistsdata px-8 sm:px-5 py-6 flex gap-6 overflow-x-auto w-full no-scrollbar">
            {home?.playlists?.map((p, i) => (
              <motion.div
                onClick={() =>
                  navigate(`/playlist/details/${p.id}`, {
                    state: {
                      image: p.image[2]?.link,
                      name: p.title,
                    },
                  })
                }
                key={i}
                whileHover={{
                  scale: 1.1,
                  boxShadow: "0 10px 15px rgba(0, 255, 15, 0.2)",
                }}
                className="flex-shrink-0 w-[15%] sm:w-[40%] p-5 bg-[#1e1e1e] rounded-lg cursor-pointer flex flex-col items-center justify-center hover:bg-[#2c2c2c] transition-all duration-300 shadow-md group"
              >
                {/* Square Playlist Cover Image with Rounded Corners */}
                <motion.div className="w-[8vw] sm:w-[20vw] h-[8vw] sm:h-[20vw] rounded-md overflow-hidden flex items-center justify-center mb-4">
                  <motion.img
                    src={p.image[2].link}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </motion.div>

                {/* Playlist Title */}
                <motion.h3 className="leading-none">
                  <p className="text-white text-xl sm:text-md font-bold">
                    {p.title.length > 15
                      ? p.title
                          .slice(0, 15)
                          .trim()
                          .replace(/[\s\(\[\{]*$/, "") + "..."
                      : p.title}
                  </p>
                </motion.h3>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center bg-gradient-to-r from-[#0f0f0f] to-[#1a1a1a] text-white px-4 py-6">
        <p className="font-semibold text-center mb-4">
          <b>© 2024 Nekron Music. All rights reserved.</b>
        </p>
        <div className="flex justify-center gap-5 text-3xl">
          <a
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform duration-300 hover:scale-125 hover:text-[#0fea0f]"
          >
            <FaFacebook />
          </a>
          <a
            href="https://www.twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform duration-300 hover:scale-125 hover:text-[#0fea0f]"
          >
            <FaTwitter />
          </a>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform duration-300 hover:scale-125 hover:text-[#0fea0f]"
          >
            <FaInstagram />
          </a>
          <a
            href="https://www.linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-transform duration-300 hover:scale-125 hover:text-[#0fea0f]"
          >
            <FaLinkedin />
          </a>
        </div>
      </div>

      <motion.div
        className={
          songlink.length > 0
            ? `duration-700 fixed z-[99] bottom-0 flex items-center w-full max-h-[30vh] py-1 px-10 bg-black`
            : "block"
        }
      >
        {songlink?.map((e, i) => (
          <motion.div
            key={i}
            className="flex w-full items-center justify-between gap-6"
          >
            <motion.div className="flex items-center gap-4 rounded-md h-[7vw] sm:h-[20vw]">
              <motion.img
                className="rounded-md h-[5vw] sm:h-[15vw]"
                src={e?.image[2]?.url}
                alt={e?.name}
              />
              <div
                className="flex flex-col"
                style={{
                  width: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                <h3 className="text-[#0ff50f] text-base font-semibold">
                  {e?.name.length > 20
                    ? e.name
                        .slice(0, 20)
                        .trim()
                        .replace(/[\s\(\[\{]*$/, "") + "..."
                    : e.name}
                </h3>
              </div>
            </motion.div>
            <div className="flex items-center gap-2 sm:gap-1 w-[50%] flex-col">
              <div className="flex justify-between">
                <button
                  onClick={pre}
                  className="text-3xl text-zinc-300 hover:text-zinc-50 cursor-pointer"
                >
                  <i className="ri-skip-back-mini-fill"></i>
                </button>

                <audio
                  ref={audioRef}
                  onPause={() => setaudiocheck(false)}
                  onPlay={() => setaudiocheck(true)}
                  className="custom-audio w-full sm:w-[80%]"
                  autoPlay
                  onEnded={next}
                  onTimeUpdate={() =>
                    setCurrentTime(audioRef.current.currentTime)
                  }
                  onLoadedMetadata={() =>
                    setTotalTime(audioRef.current.duration)
                  }
                  src={e?.downloadUrl[4]?.url}
                ></audio>

                <button
                  onClick={() => {
                    if (audioRef.current.paused) {
                      audioRef.current.play();
                    } else {
                      audioRef.current.pause();
                    }
                  }}
                  className={`text-white text-5xl ${
                    audiocheck ? "ri-pause-circle-fill" : "ri-play-circle-fill"
                  }`}
                ></button>

                <button
                  onClick={next}
                  className="text-3xl text-zinc-300 hover:text-zinc-50 cursor-pointer"
                >
                  <i className="ri-skip-right-fill"></i>
                </button>
              </div>

              <div className="flex justify-between items-center w-full sm:w-[80%]">
                {/* Current Time */}
                <span className="text-sm text-white">
                  {formatTime(audioRef.current?.currentTime || 0)}
                </span>

                {/* Time Slider */}
                <input
                  type="range"
                  className="time-slider cursor-pointer w-full mx-2"
                  min="0"
                  max={audioRef.current?.duration || 100}
                  value={audioRef.current?.currentTime || 0}
                  onInput={(e) => {
                    const newTime = e.target.value;
                    if (audioRef.current) {
                      e.target.style.background = `linear-gradient(
            to right,
            #0ff50f ${(newTime / audioRef.current.duration) * 100}%,
            #fff ${(newTime / audioRef.current.duration) * 100}%)`;
                    }
                  }}
                  onChange={(e) => {
                    if (audioRef.current) {
                      const newTime = e.target.value;
                      audioRef.current.currentTime = newTime;
                    }
                  }}
                  style={{
                    background: `linear-gradient(
          to right,
          #0ff50f ${
            (audioRef.current?.currentTime / audioRef.current?.duration) * 100
          }%,
          #fff 0%)`,
                  }}
                />

                {/* Total Duration */}
                <span className="text-sm text-white">
                  {formatTime(audioRef.current?.duration || 0)}
                </span>
              </div>
            </div>

            <motion.div className="flex items-center gap-4 sm:gap-2 justify-end">
              <i
                onClick={() => likehandle(e)}
                className={`text-2xl cursor-pointer ${
                  like ? "text-[#0ff50f]" : "text-white"
                } ri-heart-3-fill`}
              ></i>

              <div className="flex items-center gap-2">
                <i
                  onClick={() => {
                    if (audioRef.current) {
                      audioRef.current.muted = !audioRef.current.muted;
                      setForceRender((prev) => !prev);
                    }
                  }}
                  className={`text-[#0ff50f] text-xl cursor-pointer ${
                    audioRef.current?.muted
                      ? "ri-volume-mute-fill"
                      : "ri-volume-up-fill"
                  }`}
                ></i>
                <input
                  type="range"
                  className="volume-slider"
                  min="0"
                  max="1"
                  step="0.01"
                  onChange={handleVolumeChange}
                />
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  ) : (
    <Loading />
  );
};

export default Home;
