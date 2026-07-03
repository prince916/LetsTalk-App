import { useEffect, useRef } from "react";
import useGetGroupMessages from "../../context/useGetGroupMessages.js";
import Loading from "../../components/Loading.jsx";
import Avatar from "../../components/Avatar.jsx";

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
          <Avatar name={message.senderId.name} seed={message.senderId._id} src={message.senderId.profilePicture} className="h-10 w-10" fallbackClassName="text-xs" />
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
    <div className="flex-1 min-h-0 overflow-y-auto px-2 py-3 sm:px-4">
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
        <div className="flex h-full flex-1 items-center justify-center">
          <p className="text-center">
            No messages yet. Start the conversation!
          </p>
        </div>
      )}
    </div>
  );
}

export default GroupMessages;
