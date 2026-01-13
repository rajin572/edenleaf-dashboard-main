import { cn } from "../../../lib/utils";

const VideoPlayer = ({
  videoSrc,
  className,
}: {
  videoSrc: string;
  className?: string;
}) => {
  return (
    <div
      className={cn("relative max-w-full h-[80vh] bg-primary-color", className)}
    >
      <video
        src={videoSrc}
        className="w-full h-full"
        controls
        controlsList="nodownload" // Disable the download option
        disablePictureInPicture // Disable the picture-in-picture option
        preload="auto"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
