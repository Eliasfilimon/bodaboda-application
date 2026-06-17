import { Link } from "react-router-dom";
import { FiHome } from 'react-icons/fi';
import { HiOutlineArrowLeft } from 'react-icons/hi2';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-twende-navy font-jakarta text-twende-text flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-twende-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="text-center max-w-md glass-panel rounded-[3rem] p-12 border-twende-border shadow-2xl relative z-10">
        <h1 className="text-9xl font-black text-twende-primary mb-4 drop-shadow-[0_0_20px_rgba(0,168,107,0.3)]">404</h1>
        <h2 className="text-2xl font-black text-twende-text mb-3">Page Not Found</h2>
        <p className="text-twende-text-secondary mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist, has been moved, or you took a wrong turn.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-twende-primary hover:bg-twende-primary-dark text-white font-bold py-3.5 px-6 rounded-2xl shadow-glow transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <FiHome className="text-lg" /> Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="border-2 border-twende-border bg-gray-100 hover:bg-gray-100 text-twende-text font-bold py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <HiOutlineArrowLeft className="text-lg" /> Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
