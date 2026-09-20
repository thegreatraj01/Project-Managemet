/**
 * Custom API error class used to standardize backend error responses.
 * Extends the native Error class with HTTP status metadata.
 */
class ApiError extends Error {
   /**
    * Creates an API error instance.
    *
    * @param {string} [message="Something went wrong"] - Error message shown to the client.
    * @param {number} statusCode - HTTP status code associated with the error.
    * @param {Array} [errors=[]] - Additional validation or error details.
    * @param {string} [stack=""] - Optional custom stack trace to preserve.
    */
   constructor(
      message = "Something went wrong",
      statusCode,
      errors = [],
      stack = "",
   ) {
      super(message);

      this.statusCode = statusCode;
      this.errors = errors;
      this.data = null;
      this.success = false;

      if (stack) {
         this.stack = stack;
      } else {
         Error.captureStackTrace(this, this.constructor);
      }
   }
}

export { ApiError };
