/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import Markdown from "../../../../lib/components/ui/Markdown.svelte";
import { mockWaiting, silentConsoleErrors } from "../../../mocks/mock.utils";

describe("Markdown", () => {
  const mockMarkdownToSanitisedHTML = (
    transform: (value: unknown) => Promise<unknown>
  ) =>
    jest.mock("../../../../lib/services/utils.services", () => ({
      markdownToSanitisedHTML: (value) => transform(value),
    }));

  beforeAll(silentConsoleErrors);

  afterAll(() => jest.clearAllMocks());

  it("should render html content", async () => {
    mockMarkdownToSanitisedHTML((value) => Promise.resolve(value));
    const { getByText } = render(Markdown, {
      props: { text: "test" },
    });
    await waitFor(() => expect(getByText("test")).not.toBeNull());
  });

  it("should render spinner until the text is transformed", async () => {
    mockMarkdownToSanitisedHTML((value) => mockWaiting(0.5, value));
    const { container, queryByText } = render(Markdown, {
      props: { text: "test" },
    });

    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("circle")).toBeInTheDocument();
    await waitFor(() => expect(queryByText("test")).not.toBeNull());
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("should render text content on marked error", async () => {
    mockMarkdownToSanitisedHTML(() => {
      throw new Error("test");
    });
    const { container, queryByText } = render(Markdown, {
      props: { text: "text" },
    });
    await waitFor(() =>
      expect(container.querySelector(".fallback")).toBeInTheDocument()
    );
    expect(queryByText("text")).toBeInTheDocument();
  });
});
