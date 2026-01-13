import { AllImages } from "@/assets/AllImages";

const SpinLoader = () => {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-1"
      role="status"
      aria-label="Loading"
    >
      <img
        src={AllImages.logo}
        alt=""
        className="loader-hop h-10 w-auto sm:h-12"
        style={{ animation: "loader-hop 0.9s ease-in-out infinite" }}
      />
      <span
        className="loader-shadow block h-1.5 w-8 rounded-full bg-base-color sm:w-10"
        style={{ animation: "loader-shadow 0.9s ease-in-out infinite" }}
      />
    </div>
  );
};

export default SpinLoader;
