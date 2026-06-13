import React, { useState, useEffect, useRef } from "react";
import { IoSend } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import { MdClose, MdImage } from "react-icons/md";
import EmojiPicker from "emoji-picker-react";
import useSendGroupMessage from "../../context/useSendGroupMessage.js";
import useGroupSocket from "../../context/useGroupSocket.js";
import useGroup from "../../statemanage/useGroup.js";
import { useAuth } from "../../context/AuthProvider.jsx";

function GroupType() {
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const { loading, sendGroupMessage, sendGroupImageMessage } = useSendGroupMessage();
  const { sendTypingIndicator, stopTypingIndicator } = useGroupSocket();
  const { selectedGroup } = useGroup();
  const [authUser] = useAuth();
  const [typingTimeout, setTypingTimeout] = useState(null);

  const handleInputChange = (e) => {
    setMessage(e.target.value);

    // Send typing indicator
    if (selectedGroup?._id) {
      sendTypingIndicator(selectedGroup._id, authUser?.user?.name);

      // Clear previous timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Set new timeout to stop typing indicator
      const timeout = setTimeout(() => {
        stopTypingIndicator(selectedGroup._id);
      }, 3000);

      setTypingTimeout(timeout);
    }
  };

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);

    if (selectedGroup?._id) {
      sendTypingIndicator(selectedGroup._id, authUser?.user?.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !selectedImage) return;

    if (selectedImage) {
      await sendGroupImageMessage(selectedImage, message);
    } else {
      await sendGroupMessage(message);
    }
    setMessage("");
    clearSelectedImage();
    setShowEmojiPicker(false);

    // Stop typing indicator
    if (selectedGroup?._id) {
      stopTypingIndicator(selectedGroup._id);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    }
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

  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [typingTimeout, imagePreview]);

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
      <div className="flex space-x-1 h-[8vh] bg-gray-800">
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
        <div className="w-[70%] mx-2">
          <input
            type="text"
            placeholder={selectedImage ? "Add a caption..." : "Type a message..."}
            value={message}
            onChange={handleInputChange}
            className="border-gray-700 flex items-center w-full py-3 px-3 rounded-xl grow outline-none bg-slate-900 mt-1"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-ghost text-2xl"
        >
          {loading ? (
            <span className="loading loading-spinner"></span>
          ) : (
            <IoSend />
          )}
        </button>
      </div>
    </form>
  );
}

export default GroupType;
