import React from "react";
import { IoSend } from "react-icons/io5";

function Type() {
  return (
    <>
      <div className="flex space-x-3 h-[8vh] text-center bg-slate-800">
        <div className="w-[80%] mx-4">
          <input
            type="text"
            placeholder="Type here"
            className="border border-gray-700 rounded-xl flex items-center w-full grow outline-none bg-slate-900 px-4 py-3 mt-1"/>
        </div>

        <button className="text-3xl">
          <IoSend />
        </button>
      </div>
    </>
  );
}

export default Type;
