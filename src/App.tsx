import "./App.css";
import video from "@/assets/video.mp4";
import ReactPlayer from "react-player";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function App() {
    const [isOverlayHidden, setIsOverlayHidden] = useState(false);

    const handleButtonClick = () => {
        setIsOverlayHidden(!isOverlayHidden);
    };

    return (
        <>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-{calc(1200px)} h-{calc(675px)} z-0">
                <ReactPlayer
                    url={video}
                    controls={true}
                    width="1200px"
                    height="675px"
                />
            </div>
            <div
                hidden={isOverlayHidden}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-{calc(1200px)} h-{calc(675px)} z-10"
            >
                abc
            </div>
            <Button
                className="relative"
                onClick={handleButtonClick}
                children="Toggle overlay"
            />
        </>
    );
}

export default App;
