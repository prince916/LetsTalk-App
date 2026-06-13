import React, { useState, useEffect } from "react";
import { IoSend } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import useSendGroupMessage from "../../context/useSendGroupMessage.js";
import useGroupSocket from "../../context/useGroupSocket.js";
import useGroup from "../../statemanage/useGroup.js";
import { useAuth } from "../../context/AuthProvider.jsx";

function GroupType() {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { loading, sendGroupMessage } = useSendGroupMessage();
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
    if (!message.trim()) return;

    await sendGroupMessage(message);
    setMessage("");
    setShowEmojiPicker(false);

    // Stop typing indicator
    if (selectedGroup?._id) {
      stopTypingIndicator(selectedGroup._id);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [typingTimeout]);

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
      <div className="flex space-x-1 h-[8vh] bg-gray-800">
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="btn btn-ghost text-2xl ml-2 mt-1"
          aria-label="Choose emoji"
        >
          <BsEmojiSmile />
        </button>
        <div className="w-[70%] mx-2">
          <input
            type="text"
            placeholder="Type a message..."
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
