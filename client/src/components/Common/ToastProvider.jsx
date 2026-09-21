import { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastContext = createContext(null);

const TOAST_DURATION_MS = 2800;

const typeClassName = {
  success: "bg-emerald-600",
  error: "bg-rose-600",
  info: "bg-sky-600",
};

const ToastItem = ({ toast, onClose }) => {
  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-lg px-4 py-3 text-white shadow-lg ${
        typeClassName[toast.type] || typeClassName.info
      }`}
      role="status"
      aria-live="polite"
    >
      <p className="text-sm leading-5">{toast.message}</p>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        className="ml-1 text-white/80 hover:text-white"
        aria-label="알림 닫기"
      >
        x
      </button>
    </div>
  );
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((message, type = "info") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setToasts((prev) => [...prev, { id, message, type }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  const value = useMemo(
    () => ({
      success: (message) => showToast(message, "success"),
      error: (message) => showToast(message, "error"),
      info: (message) => showToast(message, "info"),
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[1000] flex w-[320px] max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
