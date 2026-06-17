export const Toast = ({ show, message, type = 'success', onClose }) => {
  if (!show) return null;
  const colours = {
    success: 'bg-twende-primary',
    error:   'bg-red-500',
    warning: 'bg-twende-orange',
    info:    'bg-blue-500',
  };
  return (
    <div
      role="alert"
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-twende-text text-sm font-bold max-w-sm w-full ${
        colours[type] || colours.success
      }`}
    >
      <span className="flex-1 text-center">{message}</span>
      {onClose && (
        <button onClick={onClose} className="text-twende-text-secondary hover:text-twende-text text-lg leading-none">&times;</button>
      )}
    </div>
  );
};
