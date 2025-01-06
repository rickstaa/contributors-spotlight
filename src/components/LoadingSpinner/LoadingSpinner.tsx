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
    <div className="fixed inset-0 flex items-center justify-center">
      <ClipLoader
        color={twConfig.theme.colors.livepeer}
        size={50}
        loading={true}
      />
    </div>
  );
};

export default LoadingSpinner;
