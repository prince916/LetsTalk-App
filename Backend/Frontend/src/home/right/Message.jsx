import React from "react";

function Message({ message }) {
  const authUser = JSON.parse(localStorage.getItem("ChatApp"));
  const itsMe = message.senderId === authUser.user._id;

  const chatName = itsMe ? "chat-end" : "chat-start";
  const chatColor = itsMe ? "bg-gradient-to-r from-sky-500 to-blue-600" : "bg-slate-800";

  const createdAt = new Date(message.createdAt);
  const formattedTime = createdAt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="px-2 py-2 sm:px-3">
      <div className={`chat ${chatName}`}>
        <div className={`chat-bubble w-fit max-w-[88%] rounded-2xl px-3 py-2 text-sm text-white shadow-lg shadow-black/20 sm:max-w-[80%] sm:px-4 sm:py-3 ${chatColor}`}>
          {message.messageType === "image" && message.imageUrl ? (
            <div className="space-y-2">
              <a href={message.imageUrl} target="_blank" rel="noreferrer">
                <img src={message.imageUrl} alt={message.message || "Sent image"} className="max-h-72 max-w-xs rounded-xl object-cover" />
              </a>
              {message.message && <p className="wrap-break-word">{message.message}</p>}
            </div>
          ) : (
            <p className="wrap-break-word">{message.message}</p>
          )}
        </div>
        <div className={`chat-footer mt-1 text-[11px] text-slate-400 ${itsMe ? "text-right" : "text-left"}`}>{formattedTime}</div>
      </div>
    </div>
  );
}

export default Message;
