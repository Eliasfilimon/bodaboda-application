import { Link } from "react-router-dom";
import { FiHome, FiArrowLeft } from "react-icons/fi";

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-sand-50 text-navy-900 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-9xl font-bold text-amber-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-navy-900 mb-2">Page Not Found</h2>
        <p className="text-navy-700 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2"
          >
            <FiHome /> Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="border-2 border-navy-900 text-navy-900 hover:bg-navy-900 hover:text-white font-bold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2"
          >
            <FiArrowLeft /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
