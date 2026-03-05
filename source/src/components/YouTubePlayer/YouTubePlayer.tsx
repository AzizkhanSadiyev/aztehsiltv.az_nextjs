"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type YouTubePlayerProps = {
  src: string;
  title?: string;
  autoPlay?: boolean;
  className?: string;
};

export default function YouTubePlayer({
  src,
  title,
  autoPlay = false,
  className = "",
}: YouTubePlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [hasSound, setHasSound] = useState(false);
  const hasAttemptedAutoUnmute = useRef(false);

  const resolvedSrc = useMemo(() => {
    try {
      const url = new URL(src);
      url.searchParams.set("enablejsapi", "1");
      url.searchParams.set("playsinline", "1");
      if (typeof window !== "undefined") {
        url.searchParams.set("origin", window.location.origin);
      }
      if (autoPlay) {
        url.searchParams.set("autoplay", "1");
        url.searchParams.set("mute", "1");
      } else {
        url.searchParams.set("mute", "0");
      }
      return url.toString();
    } catch {
      return src;
    }
  }, [src, autoPlay]);

  const postMessage = useCallback((message: Record<string, unknown>) => {
    const frame = iframeRef.current;
    if (!frame?.contentWindow) return;
    frame.contentWindow.postMessage(JSON.stringify(message), "*");
  }, []);

  const handleUnmute = useCallback(() => {
    postMessage({ event: "command", func: "unMute", args: [] });
    postMessage({ event: "command", func: "setVolume", args: [100] });
    postMessage({ event: "command", func: "playVideo", args: [] });
    setHasSound(true);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem("yt-live-sound", "1");
    }
  }, [postMessage]);

  const canAutoUnmute = useCallback(() => {
    if (typeof navigator === "undefined") return false;
    const activation = (navigator as any).userActivation as
      | { isActive?: boolean; hasBeenActive?: boolean }
      | undefined;
    return Boolean(activation?.isActive || activation?.hasBeenActive);
  }, []);

  useEffect(() => {
    if (!autoPlay || hasSound) return;
    if (hasAttemptedAutoUnmute.current) return;
    hasAttemptedAutoUnmute.current = true;
    const timer = window.setTimeout(() => {
      handleUnmute();
    }, 200);
    return () => window.clearTimeout(timer);
  }, [autoPlay, hasSound, handleUnmute, canAutoUnmute]);

  useEffect(() => {
    if (!autoPlay || hasSound) return;
    const tryUnmute = () => {
      handleUnmute();
      window.removeEventListener("pointerdown", tryUnmute);
      window.removeEventListener("keydown", tryUnmute);
    };
    window.addEventListener("pointerdown", tryUnmute, { once: true });
    window.addEventListener("keydown", tryUnmute, { once: true });
    return () => {
      window.removeEventListener("pointerdown", tryUnmute);
      window.removeEventListener("keydown", tryUnmute);
    };
  }, [autoPlay, hasSound, handleUnmute]);

  return (
    <div className={className} style={{ position: "relative" }}>
      <iframe
        ref={iframeRef}
        src={resolvedSrc}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      {!hasSound ? (
        <button
          type="button"
          onClick={handleUnmute}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            background: autoPlay ? "rgba(0,0,0,0.35)" : "transparent",
            color: "#fff",
            border: "none",
            borderRadius: 0,
            padding: 0,
            fontSize: 12,
            fontWeight: 600,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "flex-start",
          }}
        >
          {autoPlay ? (
            <span
              style={{
                margin: 16,
                background: "rgba(0,0,0,0.7)",
                borderRadius: 999,
                padding: "8px 14px",
              }}
            >
              Sesi ac
            </span>
          ) : null}
        </button>
      ) : null}
    </div>
  );
}
