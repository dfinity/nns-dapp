/**
 * Sanitize HTML using DOMPurify
 * @see {@link https://github.com/cure53/DOMPurify}
 */
export const sanitize = async (): Promise<(text: string) => string> => {
  const url = "/assets/assets/libs/purify.min.js";
  const { sanitize: purify } = (await import(url)).default;
  return purify;
};
