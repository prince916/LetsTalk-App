import React, { useEffect, useRef } from "react";
import useGroup from "../../statemanage/useGroup.js";
import useGetGroupMessages from "../../context/useGetGroupMessages.js";
import Loading from "../../components/Loading.jsx";

function GroupMessage({ message, isMe }) {
  const createdAt = new Date(message.createdAt);
  const formattedTime = createdAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const chatName = isMe ? "chat-end" : "chat-start";
  const chatColor = isMe ? "bg-blue-500" : "bg-gray-700";

  return (
    <div className="p-4">
      <div className={`chat ${chatName}`}>
        <div className="chat-image avatar">
          <div className="w-10 rounded-full">
            <div className="avatar placeholder">
              <div className="bg-neutral-focus text-neutral-content rounded-full w-10">
                <span className="text-xs">
                  {message.senderId.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className={`chat-bubble text-white ${chatColor}`}>
          <div className="text-xs font-semibold">{message.senderId.name}</div>
          {message.messageType === "image" && message.imageUrl ? (
            <div className="mt-1 space-y-2">
              <a href={message.imageUrl} target="_blank" rel="noreferrer">
                <img
                  src={message.imageUrl}
                  alt={message.message || "Sent image"}
                  className="max-h-48 md:max-h-72 max-w-50 md:max-w-xs rounded-lg object-cover"
                />
              </a>
              {message.message && <p>{message.message}</p>}
            </div>
          ) : (
            message.message
          )}
        </div>
        <div className="chat-footer text-xs opacity-50">{formattedTime}</div>
      </div>
    </div>
  );
}

function GroupMessages() {
  const { loading, groupMessages } = useGetGroupMessages();
  const authUser = JSON.parse(localStorage.getItem("ChatApp"));
  const lastMsgRef = useRef();

  useEffect(() => {
    setTimeout(() => {
      if (lastMsgRef.current) {
        lastMsgRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }, [groupMessages]);

  return (
    <div className="flex-1 overflow-y-auto">
      {loading ? (
        <Loading />
      ) : groupMessages.length > 0 ? (
        groupMessages.map((message) => (
          <div key={message._id} ref={lastMsgRef}>
            <GroupMessage
              message={message}
              isMe={message.senderId._id === authUser.user._id}
            />
          </div>
        ))
      ) : (
        <div className="flex flex-1 items-center justify-center h-full">
          <p className="text-center">
            No messages yet. Start the conversation!
          </p>
        </div>
      )}
    </div>
  );
}

export default GroupMessages;
