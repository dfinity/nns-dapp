import { createRawSnippet } from "svelte";

export const mockSnippet = createRawSnippet(() => ({
  render: () => `<div>Mock Snippet</div>`,
}));
