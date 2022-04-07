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
  href: string | null | undefined,
  title: string | null | undefined,
  alt: string
): string => {
  if (href === undefined || href === null || href?.length === 0) {
    return alt;
  }
  const fileExtention = href.includes(".")
    ? (href.split(".").pop() as string)
    : "";
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attr-type
  const typeProp =
    fileExtention === "" ? undefined : ` type="image/${fileExtention}"`;
  const titleDefined = title !== undefined && title !== null;
  const titleProp = titleDefined ? ` title="${title}"` : undefined;
  const text = alt === "" ? (titleDefined ? title : href) : alt;

  return `<a href="${href}" target="_blank" rel="noopener noreferrer"${
    typeProp === undefined ? "" : typeProp
  }${titleProp === undefined ? "" : titleProp}>${text}</a>`;
};

export const renderer = (marked: Marked): Renderer => {
  const renderer = new marked.Renderer();
  // custom link renderer
  renderer.link = targetBlankLinkRenderer;
  renderer.image = imageToLinkRenderer;

  return renderer;
};
