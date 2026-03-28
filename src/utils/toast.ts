import { reactive } from "vue";
import type { Toast } from "@/types";

const TOAST_DURATION = 4000;

export const toastState = reactive({
  toasts: [] as Toast[],
});

export const toast = {
  show(message: string, type: Toast["type"] = "success") {
    const id = Date.now();
    toastState.toasts.push({ id, message, type, duration: TOAST_DURATION });

    setTimeout(() => {
      this.remove(id);
    }, TOAST_DURATION);
  },

  success(msg: string) {
    this.show(msg, "success");
  },
  error(msg: string) {
    this.show(msg, "danger");
  },
  warning(msg: string) {
    this.show(msg, "warning");
  },
  info(msg: string) {
    this.show(msg, "info");
  },

  remove(id: number) {
    toastState.toasts = toastState.toasts.filter((t) => t.id !== id);
  },
};
