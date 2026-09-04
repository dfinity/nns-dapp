import { isNullish, nonNullish } from "@dfinity/utils";

/**
 * A proposal summary is written by whoever submits the proposal. The Markdown
 * component renders it with marked, which passes raw inline HTML through, and
 * sanitizes the result with the default DOMPurify configuration. That default
 * keeps `<form>`, `<input>`, `<style>` inside an element, the `style`
 * attribute, and any `class` or `id`, so a summary can paint over the wallet
 * UI and imitate it.
 *
 * The helpers below run over the rendered nodes and keep only the tags and the
 * attributes that a proposal needs. Every list here comes from a census of the
 * rendered output of 6399 NNS proposal summaries.
 */

// Tags that marked produces for markdown, plus the inline formatting tags that
// carry no layout, no styling and no input.
const ALLOWED_TAGS = new Set([
  "a",
  "abbr",
  "b",
  "blockquote",
  "br",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "dd",
  "del",
  "dfn",
  "dl",
  "dt",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "ins",
  "kbd",
  "li",
  "mark",
  "ol",
  "p",
  "pre",
  "q",
  "s",
  "samp",
  "small",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
  "var",
  "wbr",
]);

// Tags whose text content is code or markup instead of prose. They are removed
// with their subtree. Every other rejected tag is unwrapped, so its text stays
// visible.
const DROPPED_TAGS = new Set([
  "head",
  "math",
  "noscript",
  "script",
  "style",
  "svg",
  "template",
  "title",
]);

const SAFE_LINK_SCHEMES = ["http", "https", "mailto"];

// A link without a scheme is relative, so it stays inside the dapp.
const isSafeHref = (value: string): boolean => {
  const scheme = value.match(/^\s*([a-zA-Z][a-zA-Z0-9+.-]*):/)?.[1];
  return isNullish(scheme) || SAFE_LINK_SCHEMES.includes(scheme.toLowerCase());
};

const matches =
  (pattern: RegExp) =>
  (value: string): boolean =>
    pattern.test(value);

type AttributeGuard = (value: string) => boolean;

const CELL_ATTRIBUTES = new Map<string, AttributeGuard>([
  ["align", matches(/^(left|center|right|justify)$/)],
  ["colspan", matches(/^\d{1,3}$/)],
  ["rowspan", matches(/^\d{1,3}$/)],
]);

// Attributes kept per tag. Everything else is removed, the `style`, `class`
// and `id` attributes included. These are Maps and not objects, so that an
// attribute named after a property of Object.prototype finds no guard.
const ALLOWED_ATTRIBUTES = new Map<string, Map<string, AttributeGuard>>([
  [
    "a",
    new Map<string, AttributeGuard>([
      ["href", isSafeHref],
      // The Markdown component adds `target` and `type` when it turns a
      // markdown image into a link.
      ["target", matches(/^_blank$/)],
      ["title", () => true],
      ["type", matches(/^[a-zA-Z0-9!#$&^_.+-]+\/[a-zA-Z0-9!#$&^_.+-]+$/)],
    ]),
  ],
  // marked writes the language of a fenced code block into this class.
  [
    "code",
    new Map<string, AttributeGuard>([
      ["class", matches(/^language-[a-zA-Z0-9+#._-]+$/)],
    ]),
  ],
  ["ol", new Map<string, AttributeGuard>([["start", matches(/^\d{1,9}$/)]])],
  ["td", CELL_ATTRIBUTES],
  ["th", CELL_ATTRIBUTES],
]);

// Move the children of the element up to its parent, then remove the element.
const unwrapElement = (element: Element): void => {
  const parent = element.parentNode;
  if (isNullish(parent)) {
    return;
  }
  while (nonNullish(element.firstChild)) {
    parent.insertBefore(element.firstChild, element);
  }
  parent.removeChild(element);
};

const filterAttributes = ({
  element,
  tag,
}: {
  element: Element;
  tag: string;
}): void => {
  const guards = ALLOWED_ATTRIBUTES.get(tag);
  for (const { name, value } of Array.from(element.attributes)) {
    const guard = guards?.get(name.toLowerCase());
    if (isNullish(guard) || !guard(value)) {
      element.removeAttribute(name);
    }
  }
  // A link that opens a new tab must not give that tab access to this one.
  if (tag === "a" && element.getAttribute("target") === "_blank") {
    element.setAttribute("rel", "noopener noreferrer");
  }
};

/**
 * Keep only the allowed tags and attributes inside the given element.
 *
 * The element itself is not touched, only its descendants. The function is
 * idempotent, so a second call over the same tree changes nothing.
 */
export const sanitizeRenderedMarkdown = (root: Element): void => {
  for (const element of Array.from(root.querySelectorAll("*"))) {
    // An earlier iteration can already have dropped this element.
    if (!root.contains(element)) {
      continue;
    }

    const tag = element.tagName.toLowerCase();

    if (DROPPED_TAGS.has(tag)) {
      element.remove();
      continue;
    }

    if (!ALLOWED_TAGS.has(tag)) {
      unwrapElement(element);
      continue;
    }

    filterAttributes({ element, tag });
  }
};

/**
 * Sanitize the element now, and again after every change to its subtree.
 *
 * The Markdown component fills the element asynchronously, so the caller
 * cannot know when the content arrives. A MutationObserver callback runs at
 * the end of the current microtask checkpoint, which is before the browser
 * paints, so rejected markup never reaches the screen.
 *
 * @returns a function that stops the observer.
 */
export const observeRenderedMarkdown = (root: Element): (() => void) => {
  sanitizeRenderedMarkdown(root);

  const observer = new MutationObserver(() => sanitizeRenderedMarkdown(root));
  observer.observe(root, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  return () => observer.disconnect();
};
