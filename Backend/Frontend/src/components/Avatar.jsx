import React from "react";

const PALETTES = [
  "from-sky-500 via-cyan-500 to-blue-600",
  "from-violet-500 via-fuchsia-500 to-purple-600",
  "from-emerald-500 via-teal-500 to-green-600",
  "from-amber-500 via-orange-500 to-rose-500",
  "from-pink-500 via-rose-500 to-red-600",
  "from-indigo-500 via-blue-500 to-cyan-600",
];

function getAvatarStyle(seed, name) {
  const source = `${seed || ""}${name || ""}`.toLowerCase();
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = source.charCodeAt(index) + ((hash << 5) - hash);
  }

  const paletteIndex = Math.abs(hash) % PALETTES.length;
  const initials = (name || "U")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

  return {
    initials,
    gradientClass: PALETTES[paletteIndex],
  };
}

function Avatar({ name = "User", seed, src, className = "h-12 w-12", imageClassName = "h-full w-full object-cover", fallbackClassName = "text-sm font-semibold" }) {
  const { initials, gradientClass } = getAvatarStyle(seed, name);

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-full ring-1 ring-white/10 ${className}`}>
      {src ? (
        <img src={src} alt={name} className={imageClassName} />
      ) : (
        <div className={`flex h-full w-full items-center justify-center bg-linear-to-br ${gradientClass} text-white ${fallbackClassName}`}>
          <span>{initials}</span>
        </div>
      )}
    </div>
  );
}

export default Avatar;
