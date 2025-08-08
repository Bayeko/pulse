import type { ToastProps } from '../components/ui/toast';

export function toast(_props: ToastProps) {}

export function useToast() {
  return {
    toast,
    dismiss: (_id?: string) => {},
    toasts: [] as ToastProps[],
  };
}
