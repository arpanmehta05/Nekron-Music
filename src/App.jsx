import React from "react";
import { Route, Routes } from "react-router-dom";
import Playlist from "./components/Playlist";
import PlaylistDetails from "./components/PlaylistDetails";
import Artists from "./components/Artists";
import ArtistsDetails from "./components/ArtistsDetails";
import Home from "./components/Home";
import AlbumDetails from "./components/AlbumDetails";
import Album from "./components/Album";
import Songs from "./components/Songs";
import Likes from "./components/Likes";




const App = () => {
  return (
    <div className="w-full h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/songs" element={<Songs />} />
        <Route path="/album" element={<Album />} />
        <Route path="/albums/details/:id" element={<AlbumDetails />} />
        <Route path="/playlist" element={<Playlist />} />
        <Route path="/playlist/details/:id" element={<PlaylistDetails />} />
        <Route path="/artists" element={<Artists />} />
        <Route path="/artists/details/:id" element={<ArtistsDetails />} />
        <Route path="/likes" element={<Likes/>} />
      </Routes>
    </div>
  );
};

export default App;
