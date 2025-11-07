import toast from "react-hot-toast"

/** Show a success toast */
export const showSuccess = (message: string) => {
  toast.success(message, { duration: 3000, position: "top-right", icon: "✅" })
}

/** Show an error toast */
export const showError = (message: string) => {
  toast.error(message, { duration: 5000, position: "top-right", icon: "❌" })
}

/** Show a loading toast; returns toast id */
export const showLoading = (message: string) => {
  return toast.loading(message, { position: "top-right" })
}

/** Dismiss a toast by id */
export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId)
}

/** Show an informational toast */
export const showInfo = (message: string) => {
  toast(message, { duration: 4000, position: "top-right", icon: "ℹ️" })
}
