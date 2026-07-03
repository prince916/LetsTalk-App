import { useEffect, useRef, useState } from "react";
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
        <div className="absolute bottom-full left-2 z-50 mb-2">
          <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" width={Math.min(320, window.innerWidth - 20)} height={350} />
        </div>
      )}
      {imagePreview && (
        <div className="absolute bottom-full left-4 z-40 mb-2 w-44 rounded-2xl border border-slate-700 bg-slate-900 p-2 shadow-xl md:w-52">
          <button type="button" onClick={clearSelectedImage} className="btn btn-xs btn-circle absolute -right-2 -top-2" aria-label="Remove selected image">
            <MdClose />
          </button>
          <img src={imagePreview} alt="Selected preview" className="max-h-32 w-full rounded-xl object-cover md:max-h-40" />
          <p className="mt-2 truncate text-xs text-slate-300">{selectedImage?.name}</p>
        </div>
      )}

      <div className="flex min-h-14 items-center gap-1 rounded-[22px] border border-white/10 bg-slate-900/90 px-1 py-1 shadow-lg shadow-black/20">
        <button type="button" onClick={() => setShowEmojiPicker((prev) => !prev)} className="btn btn-ghost h-10 w-10 rounded-2xl p-0 text-xl text-slate-300 hover:bg-slate-800 hover:text-white md:h-12 md:w-12 md:text-2xl" aria-label="Choose emoji">
          <BsEmojiSmile />
        </button>
        <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-ghost h-10 w-10 rounded-2xl p-0 text-xl text-slate-300 hover:bg-slate-800 hover:text-white md:h-12 md:w-12 md:text-2xl" aria-label="Attach image">
          <MdImage />
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        <input
          type="text"
          placeholder={selectedImage ? "Add a caption..." : "Type a message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-w-0 flex-1 rounded-xl bg-transparent px-3 py-2 text-sm outline-none placeholder:text-slate-500 md:text-base"
        />
        <button type="submit" disabled={loading} className="btn h-10 w-10 rounded-2xl border-0 bg-sky-500/90 p-0 text-white hover:bg-sky-400 disabled:opacity-60 md:h-12 md:w-12">
          {loading ? <span className="loading loading-spinner loading-sm" /> : <IoSend className="text-lg" />}
        </button>
      </div>
    </form>
  );
}

export default Typesend;
