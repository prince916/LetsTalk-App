import { useEffect, useRef } from "react";
import Message from "./Message";
import useGetMessage from "../../context/useGetMessage.js";
import Loading from "../../components/Loading.jsx";
import useGetSocketMessage from "../../context/useGetSocketMessage.jsx";

function Messages() {
  const { loading, messages } = useGetMessage();
  useGetSocketMessage();

  const lastMsgRef = useRef();
  useEffect(() => {
    setTimeout(() => {
      if (lastMsgRef.current) {
        lastMsgRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  }, [messages]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto overflow-x-hidden bg-transparent px-2 py-3 sm:px-4">
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loading />
        </div>
      ) : messages.length > 0 ? (
        messages.map((message) => (
          <div key={message._id} ref={lastMsgRef}>
            <Message message={message} />
          </div>
        ))
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 px-5 py-4 text-center text-sm text-slate-400 shadow-lg shadow-black/20">
            Say hello to start the conversation.
          </div>
        </div>
      )}
    </div>
  );
}

export default Messages;