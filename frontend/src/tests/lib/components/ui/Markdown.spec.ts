/**
 * @jest-environment jsdom
 */

import Markdown from "$lib/components/ui/Markdown.svelte";
import { render, waitFor } from "@testing-library/svelte";
import { mockWaiting, silentConsoleErrors } from "../../../utils/utils.test-utils";

let transform: (unknown) => Promise<unknown>;
jest.mock("$lib/utils/html.utils", () => ({
  markdownToSanitizedHTML: (value) => transform(value),
}));

describe("Markdown", () => {
  beforeAll(silentConsoleErrors);
  afterAll(() => jest.clearAllMocks());

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
