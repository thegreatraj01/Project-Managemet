/**
 * Standard API response wrapper for successful or structured responses.
 */
export class ApiResponse {
   /**
    * Creates a standardized API response object.
    *
    * @param {number} statusCode - HTTP status code for the response.
    * @param {string} [message="Success"] - Response message.
    * @param {*} [data] - Payload to send with the response.
    */
   constructor(statusCode, message = "Success", data) {
      this.statusCode = statusCode;
      this.data = data;
      this.message = message;
      this.success = statusCode < 400;
   }
}
