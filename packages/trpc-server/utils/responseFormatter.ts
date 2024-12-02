import { StatusCode } from "./status-codes";

class ApiResponse<T> {
  statusCode: StatusCode;
  message: string;
  data: T;
  success: boolean;
  meta: {
    timestamp: string;
    requestId: string;
    path: string;
  };

  constructor(
    statusCode: StatusCode,
    message: string = "success",
    data: T = null as any,
    requestId: string = "generated-request-id",
    path: string = "/default-path"
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.success = statusCode < 400; // If status code is below 400, it's a success
    this.meta = {
      timestamp: new Date().toISOString(),
      requestId,
      path,
    };
  }
}

export { ApiResponse };
