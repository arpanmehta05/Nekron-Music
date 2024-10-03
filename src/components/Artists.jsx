import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

const Artists = () => {
  const navigate = useNavigate();
  const [query, setquery] = useState("");
  const [requery, setrequery] = useState("");
  const [artists, setartists] = useState([]);
  const [search, setsearch] = useState(false);

  const Getartists = async () => {
    try {
      const { data } = await axios.get(
        `https://jiosaavan-api-2-harsh-patel.vercel.app/api/search/artists?query=${query}&limit=100`
      );
      setartists(data?.data?.results);
      localStorage.setItem("artists", JSON.stringify(data?.data?.results));
    } catch (error) {
      console.log("error", error);
    }
  };

  function searchClick() {
    if (query !== requery) {
      setrequery(query);
      setartists([]);
      setsearch(!search);
    }
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      searchClick();
    }
  }

  function seccall() {
    const intervalId = setInterval(() => {
      if (artists.length === 0 || query.length !== requery.length) {
        Getartists();
      }
    }, 1000);
    return intervalId;
  }

  useEffect(() => {
    if (query.length > 0) {
      var interval = seccall();
    }

    return () => clearInterval(interval);
  }, [search, artists]);

  useEffect(() => {
    const allData = localStorage.getItem("artists");

    if (allData) {
      const parsedData = JSON.parse(allData);
      setartists(parsedData);
    } else {
      console.log("No data found in localStorage.");
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [query]);

  return (
    <motion.div className="w-full bg-black">
      <Toaster position="top-center" reverseOrder={false} />
      <motion.div className="w-full h-[100vh]">
        <motion.div className="search gap-3 w-full sm:w-full h-[10vh] flex items-center justify-center">
          <i
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-12 h-12 border border-gray-300 bg-white rounded-full cursor-pointer text-3xl text-gray-700 ri-home-3-line hover:bg-gray-200 hover:text-green-500 transition"
          ></i>
          <input
            className="bg-white rounded-3xl p-3 sm:text-sm text-black border-none outline-none w-[50%] sm:w-[50%] sm:max-h-[5vh] max-h-[8vh]"
            onChange={(e) => setquery(e.target.value)}
            placeholder="Search Artists"
            type="search"
          />
          <p
            onClick={() => searchClick()}
            className="flex items-center justify-center w-12 h-12 border border-gray-300 bg-white rounded-full cursor-pointer text-black font-semibold text-2xl transition duration-300 hover:bg-gray-200 hover:text-green-500"
          >
            <i className="ri-search-2-line"></i>
          </p>
        </motion.div>
        <motion.div className="w-full overflow-hidden overflow-y-auto h-[85vh] flex flex-wrap px-5 gap-8 justify-center bg-black py-5">
          {artists
            ?.filter(
              (e) =>
                e?.image[2]?.url !==
                  "https://www.jiosaavn.com/_i/3.0/artist-default-music.png" &&
                e?.image[2]?.url !==
                  "https://www.jiosaavn.com/_i/3.0/artist-default-film.png"
            )
            .map((e, i) => (
              <motion.div
                key={i}
                onClick={() => navigate(`/artists/details/${e.id}`)}
                whileHover={{ scale: 1.05 }}
                className="w-[20vw] sm:w-[45vw] h-[50vh] sm:h-[45vh] bg-[#1c1c1e] hover:bg-[#333] transition-all duration-300 rounded-xl shadow-lg cursor-pointer flex flex-col justify-between p-5 relative group"
              >
                <div className="w-full h-[80%] rounded-md overflow-hidden">
                  <img
                    src={e?.image[2]?.url}
                    alt={e.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="text-white text-lg font-semibold mt-4 group-hover:text-[#0ff50f] transition-colors duration-300">
                {e.name.length > 20
                  ? e.name
                      .slice(0, 20)
                      .trim()
                      .replace(/[\s\(\[\{]*$/, "") + "..."
                  : e.name}
                </h3>
              </motion.div>
            ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Artists;
