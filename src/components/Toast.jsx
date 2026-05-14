import { useEffect } from "react";

export const Toast = ({ message, show, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-savanna-100 text-savanna-700 px-6 py-3 rounded-lg shadow-card z-50">
      {message}
    </div>
  );
};
