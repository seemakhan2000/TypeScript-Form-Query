interface BaseResponse {
  message: string;
}

interface SuccessResponse<T> extends BaseResponse {
  success: true;
  data?: T;
}

interface ErrorResponse extends BaseResponse {
  success: false;
  error?: string;
}

// Unified response function for both success and error cases
export const createResponse = <T>(
  success: boolean,
  message: string,
  payload?: T | string
): SuccessResponse<T> | ErrorResponse => {
  if (success) {
    return {
      success: true,
      message,
      data: payload as T,
    };
  } else {
    return {
      success: false,
      message,
      error: payload as string,
    };
  }
};
