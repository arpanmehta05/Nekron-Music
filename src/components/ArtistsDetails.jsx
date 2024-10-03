import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Loading from "./Loading";
import InfiniteScroll from "react-infinite-scroll-component";
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

const ArtistsDetails = () => {
  const navigate = useNavigate();
  let location = useLocation();
  let id = location.pathname;
  let newid = id.split("/");
  let finalid = newid[3];

  const [forceRender, setForceRender] = useState(false);
  const [details, setdetails] = useState([]);
  const [songlink, setsonglink] = useState([]);
  var [index, setindex] = useState("");
  var [page, setpage] = useState(0);
  const [like, setlike] = useState(false);
  const [like2, setlike2] = useState(false);
  const [existingData, setexistingData] = useState(null);
  const audioRef = useRef();
  const [hasMore, sethasMore] = useState(true);
  const [audiocheck, setaudiocheck] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const Getdetails = async () => {
    try {
      const { data } = await axios.get(
        `https://jiosaavan-api-2-harsh-patel.vercel.app/api/artists/${finalid}/songs?page=${page}`
      );
      const newData = data.data.songs.filter(
        (newItem) => !details.some((prevItem) => prevItem.id === newItem.id)
      );
      setdetails((prevState) => [...prevState, ...newData]);
      sethasMore(newData.length > 0);
      setpage(page + 1);
      if (page >= 5 && details.length === 0) {
        navigate(-1);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

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

  function likeset(e) {
    var tf =
      localStorage.getItem("likeData") &&
      JSON.parse(localStorage.getItem("likeData")).some(
        (item) => item.id == e?.id
      );
    setlike(tf);
  }

  function likehandle(i) {
    // Retrieve existing data from localStorage
    let existingData = localStorage.getItem("likeData");

    // Initialize an array to hold the updated data
    let updatedData = [];

    // If existing data is found, parse it from JSON
    if (existingData) {
      updatedData = JSON.parse(existingData);
    }

    // Check if the new data already exists in the existing data
    let exists = updatedData.some((item) => item.id === i.id);

    if (!exists) {
      // If not, add the new data
      updatedData.push(i);
      // Store the updated data back into localStorage
      localStorage.setItem("likeData", JSON.stringify(updatedData));
      setlike(true);
    } else {
      setlike(false);
      let existingData = localStorage.getItem("likeData");

      // If no data exists, there's nothing to remove
      if (!existingData) {
        console.log("No data found in localStorage.");
        return;
      }
      // Parse the existing data from JSON
      let updatedData = JSON.parse(existingData);

      // Find the index of the song with the given ID in the existing data
      const indexToRemove = updatedData.findIndex((item) => item.id === i.id);

      // If the song is found, remove it from the array
      if (indexToRemove !== -1) {
        updatedData.splice(indexToRemove, 1);

        // Store the updated data back into localStorage
        localStorage.setItem("likeData", JSON.stringify(updatedData));
      }
    }
  }

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

  const handleVolumeChange = (e) => {
    const value = e.target.value;
    audioRef.current.volume = value;

    // Set the dynamic gradient for the volume bar
    e.target.style.background = `linear-gradient(to right, #0ff50f 0%, #0ff50f ${
      value * 100
    }%, #ccc ${value * 100}%, #ccc 100%)`;
  };

  function likehandle2(i) {
    // Retrieve existing data from localStorage
    let existingData = localStorage.getItem("likeData");

    // Initialize an array to hold the updated data
    let updatedData = [];

    // If existing data is found, parse it from JSON
    if (existingData) {
      updatedData = JSON.parse(existingData);
    }

    // Check if the new data already exists in the existing data
    let exists = updatedData.some((item) => item.id === i.id);

    if (!exists) {
      // If not, add the new data
      updatedData.push(i);
      // Store the updated data back into localStorage
      localStorage.setItem("likeData", JSON.stringify(updatedData));
      setlike2(!like2);
    } else {
      setlike2(!like2);
      let existingData = localStorage.getItem("likeData");

      // If no data exists, there's nothing to remove
      if (!existingData) {
        console.log("No data found in localStorage.");
        return;
      }
      // Parse the existing data from JSON
      let updatedData = JSON.parse(existingData);

      // Find the index of the song with the given ID in the existing data
      const indexToRemove = updatedData.findIndex((item) => item.id === i.id);

      // If the song is found, remove it from the array
      if (indexToRemove !== -1) {
        updatedData.splice(indexToRemove, 1);

        // Store the updated data back into localStorage
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

          resolve(); // Resolve the promise once the download is complete
        } catch (error) {
          console.log("Error fetching or downloading files", error);
          reject("Error downloading song");
        }
      }),
      {
        loading: `Song ${name} Downloading...`, // Loading message
        success: `Song Downloaded ✅`, // Success message
        error: <b>Error downloading song.</b>, // Error message
      }
    );
  };

  function seccall() {
    const intervalId = setInterval(() => {
      if (!details.length > 0) {
        Getdetails();
      }
    }, 2000);
    return intervalId;
  }

  function newdata() {
    setTimeout(() => {
      Getdetails();
    }, 1000);
  }

  useEffect(() => {
    var interval = seccall();

    return () => clearInterval(interval);
  }, [details]);

  useEffect(() => {
    likeset(songlink[0]);
  }, [details, like, songlink, like2, existingData]);

  useEffect(() => {
    // Retrieve all data from localStorage
    const allData = localStorage.getItem("likeData");

    // Check if data exists in localStorage
    if (allData) {
      // Parse the JSON string to convert it into a JavaScript object
      const parsedData = JSON.parse(allData);

      // Now you can use the parsedData object
      setexistingData(parsedData);
    } else {
      console.log("No data found in localStorage.");
    }
  }, [details, like, songlink, like2]);

  useEffect(() => {
    const isIOS = /(iPhone|iPod|iPad)/i.test(navigator.userAgent);

    if (!isIOS && songlink.length > 0) {
      audioRef.current.play();
      initializeMediaSession();
    }
  }, [songlink]);

  var title = songlink[0]?.name;
  document.title = `${title ? title : "Nekron-Music"}`;

  return details.length ? (
    <motion.div className=" w-full h-screen  bg-[#131212]">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="w-full fixed z-[99] flex items-center pl-7 sm:h-[7vh]  h-[10vh]">
        <i
          onClick={() => navigate(-1)}
          className="flex items-center justify-center w-12 h-12 border border-gray-300 bg-white rounded-full cursor-pointer text-3xl text-gray-700 ri-arrow-left-line hover:bg-gray-200 hover:text-green-500 transition"
        ></i>
      </div>
      <InfiniteScroll
        dataLength={details.length}
        next={newdata}
        hasMore={hasMore}
        loader={
          page > 2 && <h1 className="bg-[#131212] text-zinc-300">Loading...</h1>
        }
        endMessage={<p className="bg-[#131212] text-zinc-300">No more items</p>}
      >
        <div className="w-full pt-[10vh] sm:pt-[10vh] pb-[30vh] sm:pb-[35vh] text-white p-6 bg-[#131212] flex flex-wrap justify-center gap-5 overflow-y-auto">
          {details?.map((d, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center bg-black rounded-md w-[20%] sm:w-[80%] p-4 hover:scale-105 hover:bg-gray-900 transition-transform duration-300 shadow-lg cursor-pointer"
              onClick={() => audioseter(i)}
            >
              <div className="w-full relative">
                <img
                  className="w-full rounded-md"
                  src={d.image[2].url}
                  alt={d.name}
                />
                {d.id === songlink[0]?.id && (
                  <i
                    className={`absolute top-1 right-2 text-4xl text-[#0ff50f] ${
                      audiocheck
                        ? "ri-pause-circle-fill"
                        : "ri-play-circle-fill"
                    }`}
                  ></i>
                )}
              </div>
              <div className="w-full flex flex-col items-center gap-2 mt-2">
                <h3
                  className={`text-lg font-semibold ${
                    d.id === songlink[0]?.id ? "text-[#0ff50f]" : "text-white"
                  } text-center`}
                >
                  {d.name.length > 20 ? d.name.slice(0, 20) + "..." : d.name}
                </h3>
                <h4 className="text-sm text-zinc-50 text-center">
                  {d.album.name.length > 25
                    ? d.album.name.slice(0, 25) + "..."
                    : d.album.name}
                </h4>
              </div>
              <div className="absolute bottom-[84%] left-5">
                <i
                  onClick={(e) => {
                    e.stopPropagation();
                    likehandle2(d);
                  }}
                  className={`ri-heart-3-fill text-3xl ${
                    existingData?.find((element) => element?.id === d?.id)
                      ? "text-[#0ff50f]"
                      : "text-white"
                  }`}
                ></i>
              </div>
            </div>
          ))}
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
    </motion.div>
  ) : (
    <Loading page={page} />
  );
};

export default ArtistsDetails;
