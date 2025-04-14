/**
 * Generates the current date and time in a neatly formatted string (e.g. yyyy-mm-dd hh:mm:ss).
 *
 * @param {string} format - The format string to use for generating the date and time.
 * @returns {string} The formatted date and time string.
 */
export const generateDate = (
  format: string = "{time:h:m:s}, {date:d/m/y}"
): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const formattedDate = format
    .replace("{time:h:m:s}", `${hours}:${minutes}:${seconds}`)
    .replace("{date:d/m/y}", `${day}/${month}/${year}`)
    .replace("{date:y-m-d}", `${year}-${month}-${day}`);

  return formattedDate;
};

/**
 * Generates the current time in a neatly formatted string (i.e. hh:mm:ss).
 *
 * @returns {string} The formatted time string.
 */
export const generateNowTime = (): string => {
  return generateDate("{time:h:m:s}");
};

/**
 * Generates the current date in a neatly formatted string (i.e. dd/mm/yyyy).
 *
 * @returns {string} The formatted date string.
 */
export const generateNowDate = (): string => {
  return generateDate("{date:d/m/y}");
};
