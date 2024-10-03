import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Loading from "./Loading";
import image from "../../public/liked.png";
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
import JSZip from "jszip";
import CryptoJS from "crypto-js";

function Likes() {
  const navigate = useNavigate();
  let location = useLocation();
  const [forceRender, setForceRender] = useState(false);

  const [details, setdetails] = useState([]);
  const [songs, setSongs] = useState([]);

  const [songlink, setsonglink] = useState([]);
  var [index, setindex] = useState("");
  var [rerender, setrerender] = useState(false);
  const [like, setlike] = useState(false);
  const [download, setdownload] = useState(false);
  const audioRef = useRef();
  const [audiocheck, setaudiocheck] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

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

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };
  
  function removehandle(i, ind) {
    setlike(false);
    let existingData = localStorage.getItem("likeData");

    if (!existingData) {
      console.log("No data found in localStorage.");
      return;
    }

    let updatedData = JSON.parse(existingData);

    const indexToRemove = updatedData.findIndex((item) => item.id === i);

    if (indexToRemove !== -1) {
      updatedData.splice(indexToRemove, 1);

      localStorage.setItem("likeData", JSON.stringify(updatedData));
      setrerender(!rerender);
      if (songlink[0].id != i) {
        setrerender(!rerender);
        if (index > ind) {
          setindex(index - 1);
        }
      } else {
        setrerender(!rerender);
        setsonglink([]);
      }
    } else {
      setsonglink([]);
      setrerender(!rerender);
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
        if (audioRef.current) {
          audioRef.current.play().catch((error) => {
            console.error("Play error:", error);
          });
        }
      });

      navigator.mediaSession.setActionHandler("pause", function () {
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

  const handleVolumeChange = (e) => {
    const value = e.target.value;
    audioRef.current.volume = value;

    // Set the dynamic gradient for the volume bar
    e.target.style.background = `linear-gradient(to right, #0ff50f 0%, #0ff50f ${
      value * 100
    }%, #ccc ${value * 100}%, #ccc 100%)`;
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space") {
        e.preventDefault();
        const audio = audioRef.current;
        if (audio) {
          if (audio.paused) {
            audio.play();
            setaudiocheck(true);
          } else {
            audio.pause();
            setaudiocheck(false);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
  const handleDownloadSong = (url, name, poster) => {
    return toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const res = await fetch(url);
          const blob = await res.blob();
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `${name}.mp3`;

          document.body.appendChild(link);
          link.click();

          document.body.removeChild(link);

          resolve();
        } catch (error) {
          console.log("Error fetching or downloading files", error);
          reject("Error downloading song");
        }
      }),
      {}
    );
  };

  useEffect(() => {
    const allData = localStorage.getItem("likeData");

    if (allData) {
      const parsedData = JSON.parse(allData);

      setdetails(parsedData.reverse());

      const extractedSongs = parsedData.map((song) => ({
        title: song.name,
        url: song.downloadUrl[4].url,
        image: song.image[2].url,
        artist: song.artists.primary.map((artist) => artist.name).join(" , "),
        album: song.album.name,
        year: song.year,
      }));
      setSongs(extractedSongs);
    } else {
      console.log("No data found in localStorage.");
    }
  }, [rerender, songlink]);

  useEffect(() => {
    const isIOS = /(iPhone|iPod|iPad)/i.test(navigator.userAgent);

    if (!isIOS && songlink.length > 0) {
      audioRef.current.play();
      initializeMediaSession();
    }
  }, [songlink]);
  var title = songlink[0]?.name;
  document.title = `${title ? title : "THE ULTIMATE SONGS"}`;

  return (
    <div className="w-full h-screen bg-[#131212]">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full justify-between px-3 fixed z-[99] flex pl-5 items-center gap-3 sm:h-[7vh] h-[10vh]">
        <i
          onClick={() => navigate("/")}
          className="flex items-center justify-center w-12 h-12 border border-gray-300 bg-white rounded-full cursor-pointer text-3xl text-gray-700 ri-home-3-line hover:bg-gray-200 hover:text-green-500 transition"
        ></i>
      </div>

      {details.length > 0 ? (
        <div className="flex items-center justify-center py-20">
          <img
            src={image}
            alt="Liked songs"
            className="w-[300px] h-[300px] object-cover rounded-md"
          />
        </div>
      ) : (
        <div></div>
      )}

      {details.length > 0 ? (
        <div className="flex flex-col w-full pb-10 px-4 bg-[#131212] text-white min-h-[65vh]">
          <div className="playlist-header flex justify-between pb-4 mb-6">
            <h2 className="text-3xl font-bold text-[#0ff50f]">Liked Songs</h2>
          </div>
          {details?.map((d, i) => (
            <div
              title="click on song image or name to play the song"
              key={i}
              className="flex items-center justify-between p-4 mb-4 hover:bg-gray-800 transition duration-300 rounded-md cursor-pointer"
            >
              <div
                onClick={() => audioseter(i)}
                className="flex items-center w-full gap-4"
              >
                <motion.img
                  viewport={{ once: true }}
                  className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] rounded-md"
                  src={d.image[2].url}
                  alt=""
                />
                <div className="flex flex-col">
                  <h3
                    className={`text-base font-bold ${
                      d.id === songlink[0]?.id ? "text-[#0ff50f]" : "text-white"
                    }`}
                  >
                    {d.name}
                  </h3>
                  <h4 className="text-sm text-gray-400">{d.album.name}</h4>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {d.id === songlink[0]?.id ? (
                  <i
                    className={`${
                      audiocheck ? "ri-pause-fill" : "ri-play-fill"
                    } text-3xl text-[#0ff50f]`}
                    onClick={(e) => {
                      e.stopPropagation();
                      audiocheck
                        ? audioRef.current.pause()
                        : audioRef.current.play();
                    }}
                  ></i>
                ) : (
                  <i
                    className="ri-play-fill text-3xl text-gray-400 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      audioseter(i);
                    }}
                  ></i>
                )}

                <i
                  title="Remove Song"
                  onClick={(e) => {
                    e.stopPropagation();
                    removehandle(d.id, i);
                  }}
                  className="text-2xl text-[#0ff50f] cursor-pointer ri-heart-fill"
                ></i>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          onClick={() => emptyfile()}
          className="absolute w-[27%] sm:w-[60%] left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2  cursor-pointer"
        >
          <p className="text-center text-3xl font-bold text-white">
            Save your favorites.
          </p>
          <p className="text-center text-xl font-semibold text-white">
            Tap <i className="ri-heart-line"></i> button to build your music
            library.
          </p>
        </div>
      )}
      {songlink !== null ? (
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
                      audiocheck
                        ? "ri-pause-circle-fill"
                        : "ri-play-circle-fill"
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
                  onClick={() => removehandle(e.id, i)}
                  className={`text-2xl cursor-pointer text-[#0ff50f] ri-heart-3-fill`}
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
      ) : (
        <h1>NO DATA</h1>
      )}
    </div>
  );
}

export default Likes;
