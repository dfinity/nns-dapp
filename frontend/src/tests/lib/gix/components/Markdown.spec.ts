import Markdown from "$lib/gix/components/Markdown.svelte";
import { render, waitFor } from "@testing-library/svelte";

const mockWaiting = (seconds: number, value?: unknown) =>
  new Promise((resolve) => setTimeout(() => resolve(value), seconds * 1000));

const silentConsoleErrors = () => vi.spyOn(console, "error").mockReturnValue();

let transform: (unknown: unknown) => Promise<unknown>;
vi.mock("$lib/gix/utils/markdown.utils", () => ({
  markdownToHTML: (value: string) => transform(value),
}));

describe("Markdown", () => {
  beforeEach(() => {
    silentConsoleErrors();
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

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
