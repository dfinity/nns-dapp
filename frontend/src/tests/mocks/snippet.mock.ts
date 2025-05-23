import { createRawSnippet } from "svelte";

export const createMockSnippet = (testId: string = "test-id") =>
  createRawSnippet(() => ({
    render: () => `<span data-tid=${testId}>Mock Snippet</span>`,
  }));
