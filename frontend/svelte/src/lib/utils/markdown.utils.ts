import type { marked as markedTypes, Renderer } from "marked";

type Marked = typeof markedTypes;

export const targetBlankLinkRenderer = (
  href: string | null,
  title: string | null,
  text: string
): string =>
  `<a${
    href === null
      ? ""
      : ` target="_blank" rel="noopener noreferrer" href="${href}"`
  }${title === null ? "" : ` title="${title}"`}>${text}</a>`;

export const renderer = (marked: Marked): Renderer => {
  const renderer = new marked.Renderer();
  // custom link renderer
  renderer.link = targetBlankLinkRenderer;
  return renderer;
};
