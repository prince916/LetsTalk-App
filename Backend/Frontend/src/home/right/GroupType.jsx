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
      <div className="flex items-center gap-1 min-h-14 bg-gray-800 px-1 py-1">
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
          placeholder={selectedImage ? "Add a caption..." : "Type a message..."}
          value={message}
          onChange={handleInputChange}
          className="flex-1 min-w-0 py-2 px-3 rounded-xl outline-none bg-slate-900 text-sm md:text-base"
        />
        <button
          type="submit"
          disabled={loading}
          className="btn btn-ghost text-xl md:text-2xl"
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
