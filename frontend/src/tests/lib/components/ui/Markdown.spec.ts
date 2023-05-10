import Markdown from "$lib/components/ui/Markdown.svelte";
import { mockWaiting } from "$tests/mocks/timeout.mock";
import { silentConsoleErrors } from "$tests/utils/utils.test-utils";
import { render, waitFor } from "@testing-library/svelte";
import { vi } from "vitest";

let transform: (unknown) => Promise<unknown>;
vi.mock("$lib/utils/html.utils", () => ({
  markdownToHTML: (value) => transform(value),
}));

describe("Markdown", () => {
  beforeEach(silentConsoleErrors);
  afterAll(() => vi.clearAllMocks());

  it("should render html content", async () => {
    transform = (value) => Promise.resolve(value);
    const { getByText, queryByTestId } = render(Markdown, {
      props: { text: "test1" },
    });
    await waitFor(() => expect(getByText("test1")).not.toBeNull());
    expect(queryByTestId("markdown-text")).toBeNull();
  });

  it("should render spinner until the text is transformed", async () => {
    transform = (value) => mockWaiting(0.5, value);
    const { container, queryByText, queryByTestId } = render(Markdown, {
      props: { text: "test2" },
    });

    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("circle")).toBeInTheDocument();
    await waitFor(() => expect(queryByText("test2")).not.toBeNull());
    expect(queryByTestId("markdown-text")).toBeNull();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });

  it("should render text content on marked error", async () => {
    transform = () => {
      throw new Error("test");
    };
    const { queryByTestId, queryByText } = render(Markdown, {
      props: { text: "text" },
    });
    await waitFor(() =>
      expect(queryByTestId("markdown-text")).toBeInTheDocument()
    );
    expect(queryByText("text")).toBeInTheDocument();
  });
});
