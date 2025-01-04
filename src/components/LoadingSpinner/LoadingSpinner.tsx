/**
 * @file Contains a loading spinner component.
 */
import tailwindConfig from "@/../tailwind.config";
import { ClipLoader } from "react-spinners";
import resolveConfig from "tailwindcss/resolveConfig";

const twConfig = resolveConfig(tailwindConfig);

/**
 * Loading spinner component.
 */
export const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center min-h-[500px]">
      <ClipLoader
        color={twConfig.theme.colors.livepeer}
        size={50}
        loading={true}
      />
    </div>
  );
};

export default LoadingSpinner;
