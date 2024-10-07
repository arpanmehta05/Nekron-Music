import React, { useEffect } from "react";
import loader from "./../../public/loading.gif";
import toast from "react-hot-toast";

const Loading = ({page}) => {
  useEffect(() => {
  }, [])
  
  useEffect(() => {
   if (page>=5) {
    
    toast.error(`no results found`);
   }
  }, [page])

  return (
    <div className="z-50 w-full h-full flex items-center justify-center bg-black">
    
      <img className="scale-150" src={loader} alt="" />
    </div>
  );
};

export default Loading;
