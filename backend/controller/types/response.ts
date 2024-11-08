interface SuccessResponse {
  success: true;
  message: string;
  data?: unknown;
}

interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}

export const successResponse = (
  message: string,
  data?: unknown
): SuccessResponse => ({
  success: true,
  message,
  data,
});
export const errorResponse = (
  message: string,
  error?: string
): ErrorResponse => ({
  success: false,
  message,
  error,
});
