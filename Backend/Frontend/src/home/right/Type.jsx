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
    <form onSubmit={handleSubmit} className="relative shrink-0">
      {showEmojiPicker && (
        <div className="absolute bottom-full left-2 z-50 mb-1">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme="dark"
            width={Math.min(320, window.innerWidth - 20)}
            height={350}
          />
        </div>
      )}
      {imagePreview && (
        <div className="absolute bottom-full left-4 z-40 w-44 md:w-52 rounded-lg border border-slate-700 bg-slate-900 p-2 shadow-xl mb-1">
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
            className="max-h-32 md:max-h-40 w-full rounded object-cover"
          />
          <p className="mt-2 truncate text-xs text-slate-300">
            {selectedImage?.name}
          </p>
        </div>
      )}
      <div className="flex items-center gap-1 min-h-[3.5rem] bg-gray-800 px-1 py-1">
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="btn btn-ghost text-xl md:text-2xl"
          aria-label="Choose emoji"
        >
          <BsEmojiSmile />
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-ghost text-xl md:text-2xl"
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
        <input
          type="text"
          placeholder={selectedImage ? "Add a caption..." : "Type here"}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 min-w-0 py-2 px-3 rounded-xl outline-none bg-slate-900 text-sm md:text-base"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn btn-ghost text-xl md:text-2xl"
        >
          <IoSend />
        </button>
      </div>
    </form>
  );
}

export default Typesend;
