import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { cn } from "@/shared/utils/cn";

type ToastVariant = "success" | "warning" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface NotificationContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const variantConfig: Record<
  ToastVariant,
  { icon: typeof CheckCircle; className: string }
> = {
  success: {
    icon: CheckCircle,
    className: "border-l-4 border-l-success text-success",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-l-4 border-l-warning text-warning",
  },
  error: {
    icon: AlertCircle,
    className: "border-l-4 border-l-danger text-danger",
  },
  info: {
    icon: Info,
    className: "border-l-4 border-l-info text-info",
  },
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, message, variant }]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    [],
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ toast }}>
      {children}
      {/* Toast container - bottom-right on desktop, top-center on mobile */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2 md:top-4 md:bottom-auto">
        {toasts.map((t) => {
          const config = variantConfig[t.variant];
          const Icon = config.icon;
          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-center gap-3 rounded-md bg-bg-raised px-4 py-3 shadow-dropdown backdrop-blur-sm",
                "animate-in slide-in-from-right-full fade-in duration-200",
                config.className,
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-body-sm text-text-primary">{t.message}</span>
              <button
                onClick={() => dismiss(t.id)}
                className="ml-2 shrink-0 text-text-tertiary hover:text-text-secondary"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotification must be used within NotificationProvider",
    );
  return ctx;
}
