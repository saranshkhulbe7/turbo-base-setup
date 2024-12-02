import { TRPCError } from "@trpc/server";
import { ZodError } from "zod";

// The main error formatter that combines all helpers
export const errorFormatter = ({ shape, error, path, ctx }: any) => {
  // Generic error handling
  const genericError = handleGenericError(error);

  // Zod validation error handling
  const zodError = handleZodError(error);

  // MongoDB error handling
  const mongoError = handleMongoError(error);

  // Construct a unified response
  return {
    code: shape.code,
    message: genericError?.message || "An error occurred",
    data: {
      path: path || ctx?.path || "unknown-path",
      requestId: ctx?.requestId || "unknown-request-id",
      timestamp: new Date().toISOString(),
      location: genericError?.location || null,
      validationIssues: zodError?.issues || null,
      dbError: mongoError || null,
    },
  };
};

// Define a helper to handle generic errors
function handleGenericError(error: any) {
  if (error.cause instanceof Error) {
    const message = error.cause.message;
    const location = extractErrorLocation(error.cause.stack);
    return { message, location };
  }
  return { message: "An unknown error occurred", location: null };
}

// Define a helper to handle Zod validation errors
function handleZodError(error: any) {
  if (error.cause instanceof ZodError) {
    return {
      message: "Validation error",
      issues: error.cause.flatten(),
    };
  }
  return null;
}

// Define a helper to handle MongoDB-related errors
function handleMongoError(error: any) {
  if (error.cause?.name === "MongoError") {
    return {
      message: "Database error",
      details: error.cause.message,
    };
  }
  return null;
}

// Helper to extract file and line location from a stack trace
function extractErrorLocation(stack?: string) {
  if (!stack) return null;
  const stackLines = stack.split("\n");
  const traceLine = stackLines[1]?.trim(); // Second line usually has the location info
  const match = traceLine?.match(/\(([^)]+)\)/); // Matches "(file:line:column)"
  if (match) {
    const [filePath, line, column] = match[1].split(":");
    return { file: filePath, line: `${line}:${column}` };
  }
  return null;
}
