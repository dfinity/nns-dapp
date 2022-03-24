let decoder: HTMLDivElement | undefined;
/**
 * Simple but fast string sanitizer (does NOT escape but removes HTML tags)
 * https://github.com/vuejs/vue/blob/dev/src/compiler/parser/entity-decoder.js
 */
export const removeHTMLTags = (
  text?: string | undefined
): string | null | undefined => {
  if (text === undefined) return text;

  decoder = decoder || document.createElement("div");
  decoder.innerHTML = text;
  return decoder.textContent;
};
