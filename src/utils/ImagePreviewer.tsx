/* eslint-disable @typescript-eslint/no-explicit-any */
import { PhotoProvider, PhotoView } from "react-photo-view";
import "react-photo-view/dist/react-photo-view.css";
import { FaDownload } from "react-icons/fa";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import { ReusableTooltip } from "@/Components/ui/CustomUi/ReusableTooltip";

const ImagePreviewer = ({
  imageUrl,
  image,
  msg,
  userData,
  imgHeight,
}: {
  imageUrl: string;
  image: string;
  msg: any;
  userData: any;
  imgHeight?: number;
}) => {
  if (!image) return null;

  const filePath = image.replace(/\\/g, "/");
  const fileUrl = `${imageUrl}${filePath}`;
  const isImage = /\.(jpeg|jpg|png|gif|webp|bmp|svg)$/i.test(filePath);
  const getFileName = (path: string) => path.split("/").pop() || "download";

  const handleDownload = async (url: string, filename: string) => {
    const toastId = toast.loading("Downloading...", {
      duration: 2000,
    });
    console.log(url);
    try {
      const response = await fetch(url);
      console.log(response);
      const blob = await response.blob();
      saveAs(blob, filename);
      toast.success("Downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("Download failed", err);
      toast.error("Download failed", { id: toastId });
    }
  };
  return isImage ? (
    <PhotoProvider>
      <div className={`w-32 ${imgHeight ? `h-[${imgHeight}px]` : "h-auto"}`}>
        <PhotoView src={fileUrl}>
          <img
            src={fileUrl}
            alt="Image"
            className={`cursor-pointer h-32 object-cover object-top rounded-md border border-[#0F75BD] ${msg?.sender?._id === userData?.userId ||
              msg?.sender?.toString() === userData?.userId
              ? "order-last"
              : "order-first"
              }`}
          />
        </PhotoView>
      </div>
    </PhotoProvider>
  ) : (
    <div className="flex items-center gap-2 px-3 py-2 rounded text-[#ffffff] bg-secondary-color shadow max-w-xs text-sm">
      <ReusableTooltip content={fileUrl?.split("/").pop()}>
        <span className="truncate max-w-[150px]">{getFileName(filePath)}</span>
      </ReusableTooltip>
      <button
        onClick={() => handleDownload(fileUrl, getFileName(filePath))}
        className="focus:outline-none"
      >
        <FaDownload className="text-[#ffffff99] hover:text-[#ffffff] cursor-pointer text-base" />
      </button>
    </div>
  );
};

export default ImagePreviewer;
