import { useState } from "react";

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

function getImageUrl(src) {
  if (!src) return "";

  // Absolute URL with a localhost/127.0.0.1 origin → extract just the path so
  // the browser resolves it against the current origin (Vite proxy in dev,
  // Express static in production). This fixes cross-device visibility.
  if (/^https?:\/\//i.test(src)) {
    try {
      const url = new URL(src);
      if (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(url.host)) {
        return url.pathname; // "/uploads/profiles/..."
      }
    } catch {
      // not a valid URL – fall through
    }
    return src; // keep real remote URLs as-is
  }

  // Relative path – use as-is; Vite proxy in dev and backend static in prod
  // both serve /uploads correctly without needing an explicit host.
  return src.startsWith("/") ? src : `/${src}`;
}

function Avatar({ name = "User", seed, src, className = "h-12 w-12", imageClassName = "h-full w-full object-cover", fallbackClassName = "text-sm font-semibold" }) {
  const { initials, gradientClass } = getAvatarStyle(seed, name);
  const imageUrl = getImageUrl(src);
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className={`relative shrink-0 overflow-hidden rounded-full ring-1 ring-white/10 ${className}`}>
      {imageUrl && !imgFailed ? (
        <img
          src={imageUrl}
          alt={name}
          className={imageClassName}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className={`flex h-full w-full items-center justify-center bg-linear-to-br ${gradientClass} text-white ${fallbackClassName}`}>
          <span>{initials}</span>
        </div>
      )}
    </div>
  );
}

export default Avatar;
