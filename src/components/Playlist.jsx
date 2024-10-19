import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";

const Playlist = () => {
  const navigate = useNavigate();
  const [query, setquery] = useState("");
  const [requery, setrequery] = useState("");
  var [page, setpage] = useState(1);
  const [playlist, setplaylist] = useState([]);
  const [search, setsearch] = useState(false);

  const Getplaylist = async () => {
    try {
      const { data } = await axios.get(
        `https://jiosaavan-api-2-harsh-patel.vercel.app/api/search/playlists?query=${query}&page=${page}&limit=10`
      );

      setplaylist((prevState) => [...prevState, ...data?.data?.results]);

      localStorage.setItem("playlist", JSON.stringify(playlist)); // local storage is here to store the data
      // marked for future use for addign firebase and login feature
    } catch (error) {
      console.log("error", error);
    }
  };

  function searchClick() {
    if (query !== requery) {
      setrequery(query);
      setplaylist([]);
      setpage(1);
      setsearch(!search);
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      searchClick();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [query]);

  function seccall() {
    const intervalId = setInterval(() => {
      if (
        (playlist.length >= 0 && page < 20) ||
        query.length !== requery.length
      ) {
        setpage(page + 1);
        Getplaylist();
      }
    }, 1000);
    return intervalId;
  }

  useEffect(() => {
    if (query.length > 0) {
      var interval = seccall();
    }

    return () => clearInterval(interval);
  }, [search, playlist]);

  useEffect(() => {
    const allData = localStorage.getItem("playlist");

    if (allData) {
      const parsedData = JSON.parse(allData);

      setplaylist(parsedData);
    } else {
      console.log("No data found in localStorage.");
    }
  }, []);

  return (
    <motion.div className="w-full h-[100vh] bg-[#131212]">
      <Toaster position="top-center" reverseOrder={false} />
      <motion.div className="w-full h-[100vh] ">
        <motion.div className="search gap-3 w-full sm:w-full h-[10vh] flex items-center justify-center ">
          <i
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-12 h-12 border border-gray-300 bg-white rounded-full cursor-pointer text-3xl text-gray-700 ri-home-3-line hover:bg-gray-200 hover:text-green-500 transition"
          ></i>
          <input
            className=" bg-white  rounded-3xl p-3 sm:text-sm text-black border-none outline-none w-[50%] sm:w-[50%] sm:max-h-[5vh] max-h-[8vh]"
            onChange={(e) => setquery(e.target.value)}
            placeholder="Search Playlist"
            type="search"
            name=""
            id=""
          />
          <p
            onClick={() => searchClick()}
            className="flex items-center justify-center w-12 h-12 border border-gray-300 bg-white rounded-full cursor-pointer text-black font-semibold text-2xl transition duration-300 hover:bg-gray-200 hover:text-green-500"
          >
            <i className="  ri-search-2-line"></i>
          </p>
        </motion.div>
        {playlist.length > 0 ? (
          <motion.div className="w-full overflow-hidden overflow-y-auto h-[85vh] sm:min-h-[85vh] flex flex-wrap p-5 gap-8 justify-center bg-[#131212]">
            {playlist?.map((e, i) => (
              <motion.div
                key={i}
                onClick={() =>
                  navigate(`/playlist/details/${e.id}`, {
                    state: {
                      image: e.image[2]?.url,
                      name: e.name,
                      album: e.album,
                    },
                  })
                }
                whileHover={{ scale: 1.05 }}
                className="w-[20vw] sm:w-[40vw] h-[50vh] sm:h-[25vh] bg-[#1c1c1e] hover:bg-[#333] transition-all duration-300 cursor-pointer flex flex-col relative group"
              >
                <div className="w-full h-[80%] rounded-t-md overflow-hidden">
                  <img
                    className="w-full h-full object-cover transition-transform duration-500"
                    src={e?.image[2]?.url}
                    alt={e.name}
                  />
                </div>
                <p className="text-white text-lg sm:text-[12px] h-[20%] w-full font-medium mt-7 sm:mt-3 group-hover:text-[#0ff50f] transition-colors duration-300 px-3 sm:px-3">
                  {e.name.length > 20
                    ? e.name
                        .slice(0, 20)
                        .trim()
                        .replace(/[\s\(\[\{]*$/, "") + "..."
                    : e.name}
                </p>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="absolute w-[30%] sm:w-[60%] left-1/2 top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer">
            <p className="text-center text-3xl font-bold text-white">
              Find the playlist of your choice
            </p>
            <p className="text-center text-xl font-semibold text-white">
              and groove to its curated tunes <i className="ri-music-2-line"></i>
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Playlist;
