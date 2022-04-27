import type { marked as markedTypes, Renderer } from "marked";

type Marked = typeof markedTypes;

export const targetBlankLinkRenderer = (
  href: string | null | undefined,
  title: string | null | undefined,
  text: string
): string =>
  `<a${
    href === null || href === undefined
      ? ""
      : ` target="_blank" rel="noopener noreferrer" href="${href}"`
  }${title === null || title === undefined ? "" : ` title="${title}"`}>${
    text.length === 0 ? href ?? title : text
  }</a>`;

/**
 * Based on https://github.com/markedjs/marked/blob/master/src/Renderer.js#L186
 * @returns <a> tag to image
 */
export const imageToLinkRenderer = (
  src: string | null | undefined,
  title: string | null | undefined,
  alt: string
): string => {
  if (src === undefined || src === null || src?.length === 0) {
    return alt;
  }
  const fileExtention = src.includes(".")
    ? (src.split(".").pop() as string)
    : "";
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-type
  const typeProp =
    fileExtention === "" ? undefined : ` type="image/${fileExtention}"`;
  const titleDefined = title !== undefined && title !== null;
  const titleProp = titleDefined ? ` title="${title}"` : undefined;
  const text = alt === "" ? (titleDefined ? title : src) : alt;

  return `<a href="${src}" target="_blank" rel="noopener noreferrer"${
    typeProp ?? ""
  }${titleProp ?? ""}>${text}</a>`;
};

export const renderer = (marked: Marked): Renderer => {
  const renderer = new marked.Renderer();
  // custom link renderer
  renderer.link = targetBlankLinkRenderer;
  renderer.image = imageToLinkRenderer;

  return renderer;
};

/**
 * Uses markedjs
 * @see {@link https://github.com/markedjs/marked}
 */
export const markdownToHTML = async (): Promise<(text: string) => string> => {
  const url = "/assets/assets/libs/marked.min.js";
  const { marked }: { marked: Marked } = await import(url);
  return (text: string) =>
    marked(text, {
      renderer: renderer(marked),
    });
};

/**
 * Sanitize HTML using DOMPurify
 * @see {@link https://github.com/cure53/DOMPurify}
 */
export const sanitize = async (): Promise<(text: string) => string> => {
  const url = "/assets/assets/libs/purify.min.js";
  const { sanitize: purify } = (await import(url)).default;
  return purify;
};

/**
 * Sanitize markdown text and convert it to HTML
 */
export const markdownToSanitizedHTML = async (
  text: string
): Promise<string> => {
  const [sanitizeText, convertMarkdownToHTML] = await Promise.all([
    sanitize(),
    markdownToHTML(),
  ]);
  return convertMarkdownToHTML(sanitizeText(text ?? ""));
};
