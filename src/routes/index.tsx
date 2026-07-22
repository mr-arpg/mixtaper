import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import cdAsset from "@/assets/sony_cd.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Awesome Mix — Your personal CD" },
      {
        name: "description",
        content:
          "A nostalgic mixtape CD player. Craft your own mix by sharing a YouTube playlist link with a handwritten title.",
      },
      { property: "og:title", content: "Awesome Mix — Your personal CD" },
      {
        property: "og:description",
        content:
          "A nostalgic mixtape CD player. Craft your own mix by sharing a YouTube playlist link with a handwritten title.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Share+Tech+Mono&display=swap",
      },
    ],
  }),
  component: MixtapePage,
});

// YouTube IFrame API types (minimal)
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

let ytApiLoading: Promise<void> | null = null;
function loadYouTubeAPI(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (ytApiLoading) return ytApiLoading;
  ytApiLoading = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return ytApiLoading;
}

function MixtapePage() {
  const [params, setParams] = useState<{ list: string; title: string }>({
    list: "",
    title: "",
  });
  const [playing, setPlaying] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [trackIndex, setTrackIndex] = useState(1); // 1-based display
  const playerRef = useRef<any>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Parse URL params (client-side only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    setParams({
      list: sp.get("list") ?? "",
      title: sp.get("title") ?? "",
    });
  }, []);

  // Init YouTube player when we have a playlist
  useEffect(() => {
    if (!params.list || !playerContainerRef.current) return;
    let cancelled = false;
    loadYouTubeAPI().then(() => {
      if (cancelled || !playerContainerRef.current) return;
      playerRef.current = new window.YT.Player(playerContainerRef.current, {
        height: "360",
        width: "640",
        playerVars: {
          listType: "playlist",
          list: params.list,
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onStateChange: (e: any) => {
            const YT = window.YT;
            if (e.data === YT.PlayerState.PLAYING) setPlaying(true);
            else if (
              e.data === YT.PlayerState.PAUSED ||
              e.data === YT.PlayerState.ENDED
            )
              setPlaying(false);
            // Update track index
            try {
              const idx = playerRef.current?.getPlaylistIndex?.();
              if (typeof idx === "number") setTrackIndex(idx + 1);
            } catch {}
          },
        },
      });
    });
    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;
    };
  }, [params.list]);

  // Spin animation loop
  useEffect(() => {
    if (!playing) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = null;
      return;
    }
    const tick = (t: number) => {
      if (lastTimeRef.current == null) lastTimeRef.current = t;
      const dt = t - lastTimeRef.current;
      lastTimeRef.current = t;
      // ~30deg per second
      setRotation((r) => (r + dt * 0.03) % 360);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      lastTimeRef.current = null;
    };
  }, [playing]);

  const toggle = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.pauseVideo?.();
    else p.playVideo?.();
  }, [playing]);

  const next = useCallback(() => {
    playerRef.current?.nextVideo?.();
  }, []);
  const prev = useCallback(() => {
    playerRef.current?.previousVideo?.();
  }, []);

  const hasMix = Boolean(params.list);
  const title = params.title || "Awesome Mix";
  const trackLabel = String(trackIndex).padStart(2, "0");

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Hidden YouTube player: kept 640x360 but positioned behind everything */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 opacity-0"
        style={{ zIndex: 0, width: 640, height: 360 }}
      >
        <div ref={playerContainerRef} />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-10">
        {hasMix ? (
          <>
            {/* CD */}
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
              className="group relative block cursor-pointer select-none"
              style={{
                width: "min(70vw, 70vh, 640px)",
                aspectRatio: "1 / 1",
              }}
            >
              <div
                className="relative h-full w-full"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: playing ? "none" : "transform 0.6s ease-out",
                  willChange: "transform",
                }}
              >
                <img
                  src={cdAsset.url}
                  alt="Mixtape CD"
                  className="h-full w-full select-none"
                  draggable={false}
                />
                {/* Handwritten title — placed on the lower arc of the disc */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ fontFamily: "'Caveat', cursive" }}
                >
                  <div
                    className="absolute left-1/2 top-[72%] -translate-x-1/2 -translate-y-1/2 text-center"
                    style={{
                      width: "58%",
                      color: "#6b2fd6",
                      textShadow: "0 0 1px rgba(107,47,214,0.4)",
                      fontSize: "clamp(1.25rem, 4.2vw, 2.75rem)",
                      fontWeight: 700,
                      lineHeight: 1.05,
                      transform: "translate(-50%, -50%) rotate(-6deg)",
                    }}
                  >
                    {title}
                  </div>
                </div>
              </div>


              {/* Play hint when paused */}
              {!playing && (
                <div
                  className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                >
                  <div className="rounded-full bg-black/60 px-4 py-2 text-xs uppercase tracking-widest">
                    Click to play
                  </div>
                </div>
              )}
            </button>

            {/* Controls */}
            <div className="mt-8 flex items-center gap-4">
              <button
                type="button"
                onClick={prev}
                aria-label="Previous track"
                className="text-red-600 transition-transform hover:scale-110 active:scale-95"
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 5v14l-1 0V5h1zm14 0v14L8 12l12-7z" />
                </svg>
              </button>

              <div
                className="flex h-12 w-20 items-center justify-center rounded-md border border-red-900/50 bg-black shadow-[inset_0_0_16px_rgba(255,0,0,0.15)]"
                aria-label={`Track ${trackLabel}`}
              >
                <span
                  style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    color: "#ff2a2a",
                    fontSize: "2rem",
                    letterSpacing: "0.1em",
                    textShadow:
                      "0 0 5px rgba(255,42,42,0.9), 0 0 10px rgba(255,42,42,0.6)",
                  }}
                >
                  {trackLabel}
                </span>
              </div>

              <button
                type="button"
                onClick={next}
                aria-label="Next track"
                className="text-red-600 transition-transform hover:scale-110 active:scale-95"
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 5v14h1V5h-1zM4 5l12 7L4 19V5z" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  const [playlist, setPlaylist] = useState("");
  const [title, setTitle] = useState("");

  const extractListId = (input: string): string => {
    const trimmed = input.trim();
    if (!trimmed) return "";
    try {
      const url = new URL(trimmed);
      const list = url.searchParams.get("list");
      if (list) return list;
    } catch {}
    return trimmed;
  };

  const go = () => {
    const list = extractListId(playlist);
    if (!list) return;
    const sp = new URLSearchParams();
    sp.set("list", list);
    if (title.trim()) sp.set("title", title.trim());
    window.location.search = `?${sp.toString()}`;
  };

  return (
    <div className="mx-auto max-w-xl text-center">
      <h1
        className="mb-4"
        style={{
          fontFamily: "'Caveat', cursive",
          fontSize: "clamp(2.5rem, 8vw, 5rem)",
          color: "#a78bfa",
          lineHeight: 1,
        }}
      >
        Make a mixtape
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-white/70">
        Paste a YouTube playlist link (or ID) and write a little dedication.
        Share the URL with someone — it's their CD.
      </p>

      <div className="space-y-3 text-left">
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-widest text-white/50">
            YouTube playlist URL or ID
          </span>
          <input
            value={playlist}
            onChange={(e) => setPlaylist(e.target.value)}
            placeholder="https://youtube.com/playlist?list=PL..."
            className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-purple-400"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs uppercase tracking-widest text-white/50">
            Handwritten title
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Awesome Mix for Melina"
            className="w-full rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-purple-400"
          />
        </label>
        <button
          type="button"
          onClick={go}
          className="mt-2 w-full rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-500"
        >
          Burn my CD →
        </button>
      </div>

      <p className="mt-8 text-xs text-white/40">
        Everything lives in the URL — no accounts, no server, no tracking.
      </p>
    </div>
  );
}
