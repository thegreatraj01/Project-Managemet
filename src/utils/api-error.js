// Custom error class for consistent API error responses.
class ApiError extends Error {
   constructor(
      // Error details supplied by the caller.
      message = "Something went wrong",
      statusCode,
      errors = [],
      stack = "",
   ) {
      // Initialize the built-in Error with the provided message.
      super(message);

      // Store the API error response properties.
      this.statusCode = statusCode;
      this.errors = errors;
      this.data = null;
      this.success = false;

      // Preserve a custom stack or generate one for this error instance.
      if (stack) {
         this.stack = stack;
      } else {
         Error.captureStackTrace(this, this.constructor);
      }
   }
}
