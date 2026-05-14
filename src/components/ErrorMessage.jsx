import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

export const ErrorMessage = ({ 
  message = "Something went wrong", 
  onRetry,
  showRetry = true 
}) => {
  return (
    <div className="min-h-[50vh] bg-sand-50 text-navy-900 flex flex-col items-center justify-center p-4">
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md w-full text-center">
        <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-red-800 mb-2">Oops!</h2>
        <p className="text-red-700 mb-6">{message}</p>
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-xl transition flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw /> Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export const InlineError = ({ message }) => {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl my-4">
      <p className="flex items-center gap-2">
        <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
        <span>{message}</span>
      </p>
    </div>
  );
};
