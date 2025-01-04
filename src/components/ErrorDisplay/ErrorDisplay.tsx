/**
 * @file Contains the error display component.
 */
import { FaExclamationTriangle } from "react-icons/fa";

/**
 * Represents the properties of the error display component.
 */
interface ErrorDisplayProps {
  /** The error message to display. */
  message: string;
}

/**
 * Error display component.
 * @param props - The component properties.
 */
export const ErrorDisplay = ({ message }: ErrorDisplayProps) => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[500px]">
      <FaExclamationTriangle className="text-red-500 text-6xl mb-4" />
      <h1 className="text-red-500 text-2xl">Oops! Something went wrong.</h1>
      <p className="text-red-500">{message}</p>
    </div>
  );
};

export default ErrorDisplay;
