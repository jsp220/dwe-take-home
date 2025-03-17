import "./App.css";
import originalVideo from "@/assets/original_video.mp4";
import overlayVideo from "@/assets/focus_peaking_video.mp4";
import ReactPlayer from "react-player";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { ThemeProvider } from "./components/theme-provider";

function App() {
    const originalPlayerRef = useRef<ReactPlayer>(null);
    const overlayPlayerRef = useRef<ReactPlayer>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [isOverlayHidden, setIsOverlayHidden] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleOverlayButtonClick = () => {
        setIsOverlayHidden(!isOverlayHidden);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = 1200; // Set according to your video dimensions
        const height = 675; // Set according to your video dimensions

        canvas.width = width;
        canvas.height = height;

        const offscreenCanvas = document.createElement("canvas");
        offscreenCanvas.width = width;
        offscreenCanvas.height = height;
        const offscreenCtx = offscreenCanvas.getContext("2d");

        let animationFrameId: number;

        const renderFrame = () => {
            const originalVideo =
                originalPlayerRef.current?.getInternalPlayer() as HTMLVideoElement;
            const overlayVideo =
                overlayPlayerRef.current?.getInternalPlayer() as HTMLVideoElement;

            if (
                originalVideo &&
                overlayVideo &&
                originalVideo.readyState >= 2
            ) {
                ctx.clearRect(0, 0, width, height);
                ctx.drawImage(originalVideo, 0, 0, width, height);

                if (!isOverlayHidden) {
                    offscreenCtx?.clearRect(0, 0, width, height);
                    offscreenCtx?.drawImage(overlayVideo, 0, 0, width, height);

                    const frame = offscreenCtx?.getImageData(
                        0,
                        0,
                        width,
                        height
                    );
                    const data = frame?.data;

                    if (data && frame) {
                        for (let i = 0; i < data.length; i += 4) {
                            const [r, g, b] = [
                                data[i],
                                data[i + 1],
                                data[i + 2],
                            ];
                            if (r < 10 && g < 10 && b < 10) {
                                data[i + 3] = 0; // transparent black pixels
                            }
                        }

                        offscreenCtx?.putImageData(frame, 0, 0);
                        ctx.drawImage(offscreenCanvas, 0, 0, width, height);
                    }
                }
            }

            animationFrameId = requestAnimationFrame(renderFrame);
        };

        const syncInterval = setInterval(() => {
            const originalVideo =
                originalPlayerRef.current?.getInternalPlayer() as HTMLVideoElement;
            const overlayVideo =
                overlayPlayerRef.current?.getInternalPlayer() as HTMLVideoElement;

            if (originalVideo && overlayVideo) {
                overlayVideo.currentTime = originalVideo.currentTime;
                if (!originalVideo.paused && overlayVideo.paused)
                    overlayVideo.play();
                if (originalVideo.paused && !overlayVideo.paused)
                    overlayVideo.pause();
            }
        }, 500);

        renderFrame();

        return () => {
            clearInterval(syncInterval);
            cancelAnimationFrame(animationFrameId);
        };
    }, [isOverlayHidden]);

    const togglePlayPause = () => {
        setIsPlaying((prev) => !prev);
    };

    return (
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-{calc(1200px)} h-{calc(675px)} z-0">
                <div className="hidden">
                    <ReactPlayer
                        ref={originalPlayerRef}
                        url={originalVideo}
                        playing={isPlaying}
                        controls
                        width="720px"
                        height="480px"
                    />
                    <ReactPlayer
                        ref={overlayPlayerRef}
                        url={overlayVideo}
                        muted
                        playing={isPlaying}
                        controls
                        width="720px"
                        height="480px"
                    />
                </div>
                <canvas ref={canvasRef} />
            </div>
            <Button
                className="relative mx-2"
                onClick={handleOverlayButtonClick}
            >
                {isOverlayHidden ? "Show Overlay" : "Hide Overlay"}
            </Button>
            <Button className="relative mx-2" onClick={togglePlayPause}>
                {isPlaying ? "Pause" : "Play"}
            </Button>
        </ThemeProvider>
    );
}

export default App;
