import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ConfirmContext = createContext(null);

const defaultOptions = {
  title: "확인",
  confirmText: "확인",
  cancelText: "취소",
  confirmTone: "primary",
  description: "",
};

const confirmToneClassName = {
  primary: "bg-blue-600 hover:bg-blue-700",
  danger: "bg-red-600 hover:bg-red-700",
};

const ConfirmModal = ({ request, onConfirm, onCancel }) => {
  if (!request) return null;

  const isDanger = request.confirmTone === "danger";

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/50 px-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div
            className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              isDanger ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
            }`}
            aria-hidden="true"
          >
            {isDanger ? "!" : "i"}
          </div>
          <div className="min-w-0">
            <h3 id="confirm-dialog-title" className="text-lg font-bold text-gray-900">
              {request.title}
            </h3>
            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-700">{request.message}</p>
            {request.description ? (
              <p className="mt-2 text-xs leading-5 text-gray-500">{request.description}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            autoFocus
          >
            {request.cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-semibold text-white ${
              confirmToneClassName[request.confirmTone] || confirmToneClassName.primary
            }`}
          >
            {request.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ConfirmProvider = ({ children }) => {
  const [queue, setQueue] = useState([]);
  const currentRequest = queue[0] || null;

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      setQueue((prev) => [
        ...prev,
        {
          ...defaultOptions,
          ...options,
          message,
          resolve,
        },
      ]);
    });
  }, []);

  const resolveCurrent = useCallback((result) => {
    setQueue((prev) => {
      if (prev.length === 0) return prev;
      const [first, ...rest] = prev;
      first.resolve(result);
      return rest;
    });
  }, []);

  useEffect(() => {
    if (!currentRequest) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        resolveCurrent(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [currentRequest, resolveCurrent]);

  useEffect(() => {
    return () => {
      setQueue((prev) => {
        prev.forEach((item) => item.resolve(false));
        return [];
      });
    };
  }, []);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <ConfirmModal
        request={currentRequest}
        onConfirm={() => resolveCurrent(true)}
        onCancel={() => resolveCurrent(false)}
      />
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context.confirm;
};
