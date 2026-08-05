import { ToastProps } from "../components/toast";

export const getErrorMessage = async (
  response: Response,
  fallback?: string,
): Promise<string> => {
  try {
    const data = await response.json();
    return data.message || fallback || "An error occurred.";
  } catch {
    return fallback || "An error occurred.";
  }
};

export const handleNetworkFailure = (
  error: unknown,
  setToast: (toast: ToastProps | null) => void,
) => {
  if (error instanceof Error && error.name === "AbortError") {
    setToast({
      title: "Request Timeout",
      description:
        "The request took too long to complete. Please check your connection and try again.",
      onDismiss: () => setToast(null),
      isError: true,
    });
  } else if (error instanceof TypeError) {
    setToast({
      title: "Network Error",
      description:
        "There was a network error. Please check your connection and try again.",
      onDismiss: () => setToast(null),
      isError: true,
    });
  } else {
    setToast({
      title: "Unexpected Error",
      description: "An unexpected error occurred. Please try again.",
      onDismiss: () => setToast(null),
      isError: true,
    });
  }
};
