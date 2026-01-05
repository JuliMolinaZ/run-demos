/**
 * Utilidades para mostrar toasts
 * Wrapper alrededor de sonner para consistencia
 */

let sonnerToast: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  sonnerToast = require("sonner").toast;
} catch (e) {
  // Fallback: usar console si sonner no está instalado
  sonnerToast = {
    success: (message: string, opts?: any) => {
      console.log(`✅ ${message}`, opts?.description || "");
    },
    error: (message: string, opts?: any) => {
      console.error(`❌ ${message}`, opts?.description || "");
    },
    warning: (message: string, opts?: any) => {
      console.warn(`⚠️ ${message}`, opts?.description || "");
    },
    info: (message: string, opts?: any) => {
      console.info(`ℹ️ ${message}`, opts?.description || "");
    },
    loading: (message: string) => {
      console.log(`⏳ ${message}`);
      return { dismiss: () => {} };
    },
    promise: (promise: Promise<any>, opts: any) => {
      console.log(`⏳ ${opts.loading}`);
      return promise;
    },
  };
}

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      duration: 3000,
    });
  },
  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      duration: 5000,
    });
  },
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      duration: 4000,
    });
  },
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      duration: 3000,
    });
  },
  loading: (message: string) => {
    return sonnerToast.loading(message);
  },
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  },
};

