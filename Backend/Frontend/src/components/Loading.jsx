
function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.1),_transparent_30%),linear-gradient(135deg,_#020617_0%,_#0f172a_55%,_#111827_100%)] px-4">
      <div className="animate-fade-in w-full max-w-sm rounded-[28px] border border-white/10 bg-slate-900/80 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="h-12 w-12 animate-pulse rounded-2xl bg-sky-500/20" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 rounded-full bg-slate-700 animate-pulse" />
            <div className="h-3 w-32 rounded-full bg-slate-800 animate-pulse" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-5/6"></div>
          <div className="skeleton h-4 w-4/6"></div>
          <div className="skeleton h-24 w-full"></div>
        </div>
      </div>
    </div>
  );
}

export default Loading;
