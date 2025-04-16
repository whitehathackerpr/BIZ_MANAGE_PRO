import { format } from 'date-fns';

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a date string
 * @param date - The date to format
 * @param formatStr - The format string (default: 'MMM dd, yyyy')
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date, formatStr = 'MMM dd, yyyy'): string => {
  return format(new Date(date), formatStr);
};

/**
 * Format a number with commas
 * @param num - The number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

/**
 * Format a percentage
 * @param value - The value to format as percentage
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals = 2): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format a file size
 * @param bytes - The size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Format a duration in milliseconds
 * @param ms - Duration in milliseconds
 * @returns Formatted duration string
 */
export const formatDuration = (ms: number): string => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (seconds > 0) parts.push(`${seconds}s`);

  return parts.join(' ') || '0s';
};

/**
 * Format a phone number
 * @param phone - The phone number to format
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phone;
};

/**
 * Format an address
 * @param address - The address object
 * @returns Formatted address string
 */
export const formatAddress = (address: {
  street: string;
  city: string;
  state: string;
  zip: string;
  country?: string;
}): string => {
  const parts = [
    address.street,
    address.city,
    address.state,
    address.zip,
    address.country,
  ].filter(Boolean);
  
  return parts.join(', ');
};

/**
 * Format a credit card number
 * @param cardNumber - The card number to format
 * @returns Formatted card number string
 */
export const formatCreditCard = (cardNumber: string): string => {
  const cleaned = cardNumber.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cardNumber;
};

/**
 * Format a name (first + last)
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Formatted full name
 */
export const formatName = (firstName: string, lastName: string): string => {
  return `${firstName} ${lastName}`.trim();
};

/**
 * Format a status string
 * @param status - The status string
 * @returns Formatted status string
 */
export const formatStatus = (status: string): string => {
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}; 