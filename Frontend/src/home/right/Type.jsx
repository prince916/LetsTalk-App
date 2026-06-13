import React, { useEffect, useRef, useState } from "react";
import { IoSend } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import { MdClose, MdImage } from "react-icons/md";
import EmojiPicker from "emoji-picker-react";
import useSendMessage from "../../context/useSendMessage.js";

function Typesend() {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const { loading, sendMessages, sendImageMessage } = useSendMessage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !selectedImage) return;

    if (selectedImage) {
      await sendImageMessage(selectedImage, message);
    } else {
      await sendMessages(message);
    }
    setMessage("");
    clearSelectedImage();
    setShowEmojiPicker(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  return (
    <form onSubmit={handleSubmit} className="relative">
      {showEmojiPicker && (
        <div className="absolute bottom-[8vh] left-4 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme="dark"
            width={320}
            height={400}
          />
        </div>
      )}
      {imagePreview && (
        <div className="absolute bottom-[8vh] left-4 z-40 w-52 rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-xl">
          <button
            type="button"
            onClick={clearSelectedImage}
            className="btn btn-xs btn-circle absolute -right-2 -top-2"
            aria-label="Remove selected image"
          >
            <MdClose />
          </button>
          <img
            src={imagePreview}
            alt="Selected preview"
            className="max-h-40 w-full rounded object-cover"
          />
          <p className="mt-2 truncate text-xs text-slate-300">
            {selectedImage?.name}
          </p>
        </div>
      )}
      <div className="flex space-x-1 h-[8vh]  bg-gray-800">
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="btn btn-ghost text-2xl ml-2 mt-1"
          aria-label="Choose emoji"
        >
          <BsEmojiSmile />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-ghost text-2xl mt-1"
          aria-label="Attach image"
        >
          <MdImage />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <div className=" w-[70%] mx-2">
          <input
            type="text"
            placeholder={selectedImage ? "Add a caption..." : "Type here"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border-gray-700  flex items-center w-full py-3 px-3 rounded-xl grow outline-none bg-slate-900 mt-1"
          />
        </div>
        <button type="submit" disabled={loading}>
          <IoSend className="text-3xl" />
        </button>
      </div>
    </form>
  );
}

export default Typesend;
