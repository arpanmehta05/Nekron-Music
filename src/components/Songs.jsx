import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import wavs from "../../public/wavs.gif";
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
import InfiniteScroll from "react-infinite-scroll-component";
import "./dropdown.css";

const Songs = () => {
  const navigate = useNavigate();
  const [query, setquery] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [requery, setrequery] = useState("");
  const [search, setsearch] = useState([]);
  var [index, setindex] = useState("");
  const [songlink, setsonglink] = useState([]);
  const [page, setpage] = useState(null);
  const [searchclick, setsearchclick] = useState(false);
  const [like, setlike] = useState(false);
  const [like2, setlike2] = useState(false);
  const [existingData, setexistingData] = useState(null);
  const audioRef = useRef();
  const [hasMore, sethasMore] = useState(true);
  const [audiocheck, setaudiocheck] = useState(true);
  const [forceRender, setForceRender] = useState(false);

  const Getsearch = async () => {
    try {
      if (hasMore === false) {
        setpage(page + 1);
      }
      const { data } = await axios.get(
        `https://jiosaavan-api-2-harsh-patel.vercel.app/api/search/songs?query=${requery}&page=${page}&limit=40`
      );
      if (hasMore) {
        const newData = data.data.results.filter(
          (newItem) => !search.some((prevItem) => prevItem.id === newItem.id)
        );
        setsearch((prevState) => [...prevState, ...newData]);
        sethasMore(newData.length > 0);
        setpage(page + 1);
      } else {
        const newData = data.data.results.filter(
          (newItem) => !search.some((prevItem) => prevItem.id === newItem.id)
        );
        if (newData.length > 0) {
          setsearch((prevState) => [...prevState, ...newData]);
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  function searchClick() {
    if (query !== requery) {
      setsearch([]);
      setsonglink([]);
      sethasMore(true);
      setindex("");
      setpage(1);
      setrequery(query);
      setsearchclick(!searchclick);
    }
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  function audioseter(i) {
    if (songlink[0]?.id === search[i].id) {
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
      setsonglink([search[i]]);
    }
  }

  const handleVolumeChange = (e) => {
    const value = e.target.value;
    audioRef.current.volume = value;

    e.target.style.background = `linear-gradient(to right, #0ff50f 0%, #0ff50f ${
      value * 100
    }%, #ccc ${value * 100}%, #ccc 100%)`;
  };

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
      } else {
      }
    }
  }

  function likehandle2(i) {
    let existingData = localStorage.getItem("likeData");

    let updatedData = [];

    if (existingData) {
      updatedData = JSON.parse(existingData);
    }

    let exists = updatedData.some((item) => item.id === i.id);

    if (!exists) {
      updatedData.push(i);

      localStorage.setItem("likeData", JSON.stringify(updatedData));
      setlike2(!like2);
    } else {
      setlike2(!like2);
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
      } else {
      }
    }
  }
  const initializeMediaSession = () => {
    const isIOS = /(iPhone|iPod|iPad)/i.test(navigator.userAgent);

    if ("mediaSession" in navigator) {
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
        audioRef.current.play();
      });

      navigator.mediaSession.setActionHandler("nexttrack", function () {
        next();
        audioRef.current.play();
      });
    } else {
      console.warn("MediaSession API is not supported.");
    }
    if (isIOS) {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          if (audioRef.current && audioRef.current.paused) {
            audioRef.current.play().catch((error) => {
              console.error("Play error:", error);
            });
          }
        } else {
          if (audioRef.current && !audioRef.current.paused) {
            audioRef.current.pause().catch((error) => {
              console.error("Pause error:", error);
            });
          }
        }
      });
    }
  };
  function next() {
    if (index < search.length - 1) {
      setindex(index++);
      audioseter(index);
      audioRef.current.play();
    } else {
      setindex(0);
      setsonglink([search[0]]);
      audioRef.current.play();
    }
  }
  function pre() {
    if (index > 0) {
      setindex(index--);
      audioseter(index);
      audioRef.current.play();
    } else {
      setindex(search.length - 1);
      setsonglink([search[search.length - 1]]);
      audioRef.current.play();
    }
  }

  useEffect(() => {
    setTimeout(() => {
      if (requery.length > 0) {
        Getsearch();
      }
    }, 1000);
  }, [searchclick]);

  function newdata() {
    if (page >= 2) {
      setTimeout(() => {
        Getsearch();
      }, 1000);
    }
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        searchClick();
      }
    };

    // Add the event listener
    window.addEventListener("keydown", handleKeyDown);

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [query, requery]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === " " && document.activeElement.tagName !== "INPUT") {
        event.preventDefault();
        if (audioRef.current.paused) {
          audioRef.current.play();
        } else {
          audioRef.current.pause();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    likeset(songlink[0]);
  }, [search, like, songlink, like2, existingData]);

  useEffect(() => {
    const allData = localStorage.getItem("likeData");

    if (allData) {
      const parsedData = JSON.parse(allData);

      setexistingData(parsedData);
    } else {
      console.log("No data found in localStorage.");
    }
  }, [search, like, songlink, like2]);

  useEffect(() => {
    const isIOS = /(iPhone|iPod|iPad)/i.test(navigator.userAgent);

    if (!isIOS && songlink.length > 0) {
      audioRef.current.play();
      initializeMediaSession();
    }
  }, [songlink]);

  var title = songlink[0]?.name;

  document.title = `${title ? title : "Nekron-Music"}`;
  return (
    <motion.div className="w-full  min-h-screen overflow-hidden bg-black ">
      <Toaster position="top-center" reverseOrder={false} />
      <motion.div className="search fixed  z-[99]  gap-3 w-full sm:w-full sm:max-h-[5vh] max-h-[10vh] py-8 flex items-center justify-center ">
        <i
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-12 h-12 border border-gray-300 bg-white rounded-full cursor-pointer text-3xl text-gray-700 ri-home-3-line hover:bg-gray-200 hover:text-green-500 transition"
        ></i>

        <input
          className=" bg-white  rounded-3xl p-3 sm:text-sm text-black border-none outline-none w-[50%] sm:w-[50%] sm:max-h-[5vh] max-h-[8vh]"
          onChange={(e) => setquery(e.target.value)}
          placeholder="Search Songs"
          type="search"
          name=""
          id=""
        />
        <p
          onClick={() => searchClick()}
          className="flex items-center justify-center w-12 h-12 border border-gray-300 bg-white rounded-full cursor-pointer text-black font-semibold text-2xl transition duration-300 hover:bg-gray-200 hover:text-green-500"
        >
          <i className="ri-search-2-line"></i>
        </p>
      </motion.div>
      <InfiniteScroll
        dataLength={search.length}
        next={newdata}
        hasMore={hasMore}
        loader={
          page > 2 && <h1 className="bg-[#121111] text-white">Loading...</h1>
        }
        endMessage={<p className="bg-[#121111] text-white">No more items</p>}
      >
        <div className="pt-[10vh] pb-[30vh] overflow-hidden overflow-y-auto">
          <div className="flex w-full bg-black text-white p-10 sm:p-3 sm:gap-3 sm:block flex-wrap gap-10 justify-center">
            {search?.map((d, i) => (
              <motion.div
                title="Click on song image or name to play the song"
                key={i}
                className="flex-shrink-0 h-[50%] w-[20%] sm:w-[40%] rounded-lg cursor-pointer flex flex-col transition-all duration-300 shadow-md group relative mb-3"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
                onClick={() => audioseter(i)}
              >
                <motion.div className="w-full h-[75%] rounded-md overflow-hidden flex items-center justify-center mb-4">
                  <motion.img
                    viewport={{ once: true }}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={d.image[2].url}
                    alt=""
                  />
                  <img
                    className={`absolute top-0 w-[8%] sm:w-[10%] rounded-md ${
                      d.id === songlink[0]?.id ? "block" : "hidden"
                    }`}
                    alt=""
                  />
                  {songlink.length > 0 && (
                    <i
                      className={`absolute top-[30%] left-[40%] opacity-75 text-6xl text-[#0ff50f] ${
                        d.id === songlink[0]?.id ? "block" : "hidden"
                      } ${
                        audiocheck
                          ? "ri-pause-circle-fill"
                          : "ri-play-circle-fill"
                      }`}
                    ></i>
                  )}
                </motion.div>
                <motion.div className="flex justify-between items-center w-full">
                  <div className="flex flex-col w-[75%]">
                    <p
                      className={`text-white text-xl sm:text-md font-bold leading-tight transition duration-300 ${
                        d.id === songlink[0]?.id ? "text-[#0ff50f]" : ""
                      }`}
                    >
                      {d.name.length > 20
                        ? d.name
                            .slice(0, 20)
                            .trim()
                            .replace(/[\s\(\[\{]*$/, "") + "..."
                        : d.name}
                    </p>
                    <p className="text-gray-400 text-sm sm:text-xs mt-1">
                      {d.album.name.length > 20
                        ? d.album.name
                            .slice(0, 20)
                            .trim()
                            .replace(/[\s\(\[\{]*$/, "") + "..."
                        : d.album.name}
                    </p>
                  </div>

                  <div className="flex flex-row-reverse">
                  {existingData?.find((element) => element?.id == d?.id) ? (
                    <i
                      title="Unlike"
                      onClick={(e) => {
                        e.stopPropagation();
                        likehandle2(d);
                      }}
                      className={`text-2xl m-auto flex w-[3vw] sm:w-[9vw] rounded-full justify-center items-center h-[3vw] sm:h-[9vw] duration-300 cursor-pointer text-[#0ff50f] ri-heart-3-fill`}
                    ></i>
                  ) : (
                    <i
                      title="Like"
                      onClick={(e) => {
                        e.stopPropagation();
                        likehandle2(d);
                      }}
                      className={`text-2xl m-auto flex w-[3vw] sm:w-[9vw] rounded-full justify-center items-center h-[3vw] sm:h-[9vw] duration-300 cursor-pointer text-white ri-heart-3-fill`}
                    ></i>
                  )}
                  </div>
                </motion.div>
              </motion.div>
            ))}
            {search.length > 0 && !hasMore && (
              <div className="w-full flex flex-col items-center justify-center">
                <button
                  onClick={newdata}
                  className="bg-white shadow-2xl py-2 px-1 rounded-md"
                >
                  Load more
                </button>
              </div>
            )}
          </div>
        </div>
      </InfiniteScroll>
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
                  className="volume-slider cursor-pointer"
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
    </motion.div>
  );
};
export default Songs;
