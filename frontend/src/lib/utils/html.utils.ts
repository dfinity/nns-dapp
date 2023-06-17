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
export const markdownToHTML = async (text: string): Promise<string> => {
  const url = "/assets/libs/marked.min.js";
  // The dynamic import cannot be analyzed by Vite. As it is intended, we use the /* @vite-ignore */ comment inside the import() call to suppress this warning.
  const { marked }: { marked: Marked } = await import(/* @vite-ignore */ url);
  return marked(text, {
    renderer: renderer(marked),
  });
};
