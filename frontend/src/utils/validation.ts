/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

/**
 * Phone number validation regex (US format)
 */
const PHONE_REGEX = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

/**
 * Credit card validation regex
 */
const CREDIT_CARD_REGEX = /^[0-9]{16}$/;

/**
 * Password validation regex (min 8 chars, at least one number, one letter and one special char)
 */
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

/**
 * URL validation regex
 */
const URL_REGEX = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;

/**
 * Validate email address
 * @param email - Email address to validate
 * @returns Whether the email is valid
 */
export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email);
};

/**
 * Validate phone number
 * @param phone - Phone number to validate
 * @returns Whether the phone number is valid
 */
export const isValidPhone = (phone: string): boolean => {
  return PHONE_REGEX.test(phone);
};

/**
 * Validate credit card number
 * @param cardNumber - Credit card number to validate
 * @returns Whether the credit card number is valid
 */
export const isValidCreditCard = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\D/g, '');
  return CREDIT_CARD_REGEX.test(cleaned);
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Whether the password meets strength requirements
 */
export const isValidPassword = (password: string): boolean => {
  return PASSWORD_REGEX.test(password);
};

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns Whether the URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  return URL_REGEX.test(url);
};

/**
 * Validate required field
 * @param value - Field value to validate
 * @returns Whether the field has a value
 */
export const isRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  return value !== null && value !== undefined;
};

/**
 * Validate minimum length
 * @param value - String to validate
 * @param minLength - Minimum length required
 * @returns Whether the string meets minimum length
 */
export const minLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

/**
 * Validate maximum length
 * @param value - String to validate
 * @param maxLength - Maximum length allowed
 * @returns Whether the string is within maximum length
 */
export const maxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

/**
 * Validate minimum value
 * @param value - Number to validate
 * @param min - Minimum value allowed
 * @returns Whether the number meets minimum value
 */
export const minValue = (value: number, min: number): boolean => {
  return value >= min;
};

/**
 * Validate maximum value
 * @param value - Number to validate
 * @param max - Maximum value allowed
 * @returns Whether the number is within maximum value
 */
export const maxValue = (value: number, max: number): boolean => {
  return value <= max;
};

/**
 * Validate number range
 * @param value - Number to validate
 * @param min - Minimum value allowed
 * @param max - Maximum value allowed
 * @returns Whether the number is within range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Validate file size
 * @param file - File to validate
 * @param maxSize - Maximum size in bytes
 * @returns Whether the file is within size limit
 */
export const isValidFileSize = (file: File, maxSize: number): boolean => {
  return file.size <= maxSize;
};

/**
 * Validate file type
 * @param file - File to validate
 * @param allowedTypes - Array of allowed MIME types
 * @returns Whether the file type is allowed
 */
export const isValidFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Validate date range
 * @param startDate - Start date to validate
 * @param endDate - End date to validate
 * @returns Whether the date range is valid
 */
export const isValidDateRange = (startDate: Date, endDate: Date): boolean => {
  return startDate <= endDate;
};

/**
 * Validate future date
 * @param date - Date to validate
 * @returns Whether the date is in the future
 */
export const isFutureDate = (date: Date): boolean => {
  return date > new Date();
};

/**
 * Validate past date
 * @param date - Date to validate
 * @returns Whether the date is in the past
 */
export const isPastDate = (date: Date): boolean => {
  return date < new Date();
};

/**
 * Create a validation rule object for Ant Design Form
 * @param message - Error message to display
 * @param validator - Validation function
 * @returns Validation rule object
 */
export const createValidationRule = (
  message: string,
  validator: (value: any) => boolean
) => ({
  validator: (_: any, value: any) =>
    validator(value)
      ? Promise.resolve()
      : Promise.reject(new Error(message))
}); 