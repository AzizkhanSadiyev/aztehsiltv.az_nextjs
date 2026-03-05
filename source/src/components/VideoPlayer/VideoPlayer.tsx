"use client";

import { useEffect, useMemo, useRef } from "react";
import Hls from "hls.js";
import type Plyr from "plyr";
import styles from "./VideoPlayer.module.css";

export type VideoSource = {
    src: string;
    type: string;
};

export type VideoTrack = {
    src: string;
    srclang: string;
    label: string;
    default?: boolean;
};

type VideoPlayerProps = {
    title?: string;
    poster?: string;
    sources: VideoSource[];
    tracks?: VideoTrack[];
    thumbnails?: string;
    isLive?: boolean;
    autoPlay?: boolean;
    muted?: boolean;
    loop?: boolean;
    className?: string;
};

const isHlsSource = (source: VideoSource) =>
    source.type.includes("mpegurl") || source.src.endsWith(".m3u8");

const buildQualityOptions = (levels: number[]) => {
    const unique = Array.from(new Set(levels)).filter(Boolean);
    return unique.sort((a, b) => b - a);
};

export default function VideoPlayer({
    title,
    poster,
    sources,
    tracks,
    thumbnails,
    isLive = false,
    autoPlay = false,
    muted = false,
    loop = false,
    className = "",
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const plyrRef = useRef<Plyr | null>(null);
    const hlsRef = useRef<Hls | null>(null);
    const hlsSource = useMemo(
        () => sources.find((source) => isHlsSource(source)),
        [sources]
    );
    const fallbackSources = useMemo(
        () => sources.filter((source) => !isHlsSource(source)),
        [sources]
    );

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let isMounted = true;

        plyrRef.current?.destroy();
        plyrRef.current = null;
        hlsRef.current?.destroy();
        hlsRef.current = null;

        const onQualityChange = (newQuality: number) => {
            const hls = hlsRef.current;
            if (!hls) return;
            if (newQuality === 0) {
                hls.currentLevel = -1;
                return;
            }
            const levelIndex = hls.levels.findIndex(
                (level) => level.height === newQuality
            );
            hls.currentLevel = levelIndex;
        };

        const ensureHlsQualityControls = (player: Plyr, hls: Hls) => {
            const levels = buildQualityOptions(hls.levels.map((level) => level.height));
            if (!levels.length) return;
            const playerWithOptions = player as Plyr & { options: Plyr.Options };
            playerWithOptions.options.quality = {
                default: 0,
                options: [0, ...levels],
                forced: true,
                onChange: onQualityChange,
            };
            playerWithOptions.options.i18n = {
                ...(playerWithOptions.options.i18n ?? {}),
                qualityLabel: {
                    ...(playerWithOptions.options.i18n?.qualityLabel ?? {}),
                    0: "Auto",
                },
            };
            player.quality = 0;
        };

        const initPlayer = async () => {
            const { default: PlyrConstructor } = await import("plyr");
            if (!isMounted) return;

            const plyrOptions: Plyr.Options = {
                controls: [
                    "play-large",
                    "restart",
                    "rewind",
                    "play",
                    "fast-forward",
                    "progress",
                    "current-time",
                    "duration",
                    "mute",
                    "volume",
                    "captions",
                    "settings",
                    "pip",
                    "airplay",
                    "fullscreen",
                ],
                settings: ["captions", "quality", "speed"],
                keyboard: { focused: true, global: true },
                tooltips: { controls: true, seek: true },
                seekTime: 10,
                captions: { active: true, update: true },
                fullscreen: { enabled: true, fallback: true, iosNative: true },
                storage: { enabled: true, key: "aztehsil-player" },
                speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 2] },
                ...(thumbnails ? { thumbnails: { src: thumbnails } } : {}),
            };

            const player = new PlyrConstructor(video, plyrOptions);
            plyrRef.current = player;

            if (hlsSource) {
                if (video.canPlayType("application/vnd.apple.mpegURL")) {
                    video.src = hlsSource.src;
                } else if (Hls.isSupported()) {
                    const hls = new Hls({
                        lowLatencyMode: isLive,
                        backBufferLength: isLive ? 90 : 30,
                    });
                    hlsRef.current = hls;
                    hls.loadSource(hlsSource.src);
                    hls.attachMedia(video);
                    hls.on(Hls.Events.MANIFEST_PARSED, () => {
                        ensureHlsQualityControls(player, hls);
                    });
                }
            }
        };

        void initPlayer();

        return () => {
            isMounted = false;
            plyrRef.current?.destroy();
            plyrRef.current = null;
            hlsRef.current?.destroy();
            hlsRef.current = null;
        };
    }, [hlsSource, isLive, sources, thumbnails]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => {
            if (video.muted) {
                video.muted = false;
            }
            if (video.volume < 1) {
                video.volume = 1;
            }
            if (plyrRef.current) {
                plyrRef.current.muted = false;
                plyrRef.current.volume = 1;
            }
        };

        video.addEventListener("play", handlePlay);
        return () => {
            video.removeEventListener("play", handlePlay);
        };
    }, []);

    return (
        <div className={`${styles.root} ${className}`.trim()}>
            <video
                ref={videoRef}
                className={`${styles.video} plyr`}
                controls
                playsInline
                preload="metadata"
                poster={poster}
                aria-label={title ?? "Video player"}
                autoPlay={autoPlay}
                muted={muted}
                loop={loop}
                controlsList="nodownload"
            >
                {fallbackSources.map((source) => (
                    <source key={source.src} src={source.src} type={source.type} />
                ))}
                {tracks?.map((track) => (
                    <track
                        key={`${track.src}-${track.srclang}`}
                        src={track.src}
                        kind="subtitles"
                        srcLang={track.srclang}
                        label={track.label}
                        default={track.default}
                    />
                ))}
            </video>
            {isLive ? (
                <div className={styles.liveBadge} aria-label="Live stream">
                    <span className={styles.liveDot} />
                    Live
                </div>
            ) : null}
        </div>
    );
}
