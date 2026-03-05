"use client";

import { useEffect } from "react";

type VideoViewTrackerProps = {
  videoId: string;
  delayMs?: number;
};

export default function VideoViewTracker({
  videoId,
  delayMs = 5000,
}: VideoViewTrackerProps) {
  useEffect(() => {
    if (!videoId) return;
    if (typeof window === "undefined") return;
    const key = `video_viewed:${videoId}`;
    if (window.sessionStorage.getItem(key)) return;

    const timer = window.setTimeout(() => {
      if (window.sessionStorage.getItem(key)) return;
      window.sessionStorage.setItem(key, "1");
      fetch(`/api/videos/${videoId}/view`, { method: "POST" }).catch(() => {});
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [videoId, delayMs]);

  return null;
}
