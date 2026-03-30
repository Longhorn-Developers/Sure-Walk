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
