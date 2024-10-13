import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  motion,
} from "framer-motion";
import { Toaster } from "react-hot-toast";
import InfiniteScroll from "react-infinite-scroll-component";

const Album = () => {
  const navigate = useNavigate();
  const [query, setquery] = useState("");
  const [requery, setrequery] = useState("");
  const [albums, setalbums] = useState([]);
  const [search, setsearch] = useState(false);
  var [page, setpage] = useState(1);
  const [hasMore, sethasMore] = useState(true);
  const Getalbums = async () => {
    try {
      const { data } = await axios.get(
        `https://jiosaavan-api-2-harsh-patel.vercel.app/api/search/albums?query=${requery}&page=${page}&limit=40`
      );

      setpage(page + 1);

      const newData = data.data.results.filter(
        (newItem) => !albums.some((prevItem) => prevItem.id === newItem.id)
      );
      setalbums((prevState) => [...prevState, ...newData]);
      sethasMore(newData.length > 0);
      localStorage.setItem("albums", JSON.stringify(data?.data?.results));
    } catch (error) {
      console.log("error", error);
    }
  };

  function searchClick() {
    if (query !== requery) {
      setrequery(query);
      setalbums([]);
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


  useEffect(() => {
    setTimeout(() => {
      if (query.length > 0) {
        Getalbums();
      }
    }, 1000);
  }, [search]);

  function newdata() {
    setTimeout(() => {
      Getalbums();
    }, 1000);
  }

  useEffect(() => {
    const allData = localStorage.getItem("albums");

    if (allData) {
      const parsedData = JSON.parse(allData);

      setalbums(parsedData);
    } else {
      console.log("No data found in localStorage.");
    }
  }, []);
  return (
    <InfiniteScroll
      dataLength={albums.length}
      next={newdata}
      hasMore={hasMore}
      loader={
        page > 2 && <h1 className="bg-[#131212] text-zinc-300"></h1>
      }
      endMessage={<p className="bg-[#131212] text-zinc-300"></p>}
    >
      <motion.div className="w-full h-[100vh] bg-[#131212]">
        <Toaster position="top-center" reverseOrder={false} />
        <motion.div className="w-full h-[100vh]">
          <motion.div className="search gap-3 w-full sm:w-full h-[10vh] flex items-center justify-center ">
            <i
              onClick={() => navigate(-1)}
              className="flex items-center justify-center w-12 h-12 border border-gray-300 bg-white rounded-full cursor-pointer text-3xl text-gray-700 ri-home-3-line hover:bg-gray-200 hover:text-green-500 transition"
            ></i>
            <input
              className="bg-white rounded-3xl p-3 sm:text-sm text-black border-none outline-none w-[50%] sm:w-[50%] sm:max-h-[5vh] max-h-[8vh]"
              onChange={(e) => setquery(e.target.value)}
              placeholder="Search Albums"
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

          <motion.div className="w-full overflow-hidden overflow-y-auto h-[85vh] sm:min-h-[85vh] flex flex-wrap p-5 gap-8 justify-center bg-[#131212]">
            {albums?.map((e, i) => (
              <motion.div
              key={i}
              onClick={() =>
                navigate(`/albums/details/${e.id}`, {
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
        </motion.div>
      </motion.div>
    </InfiniteScroll>
  );
};

export default Album;
