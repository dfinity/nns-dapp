/**
 * @jest-environment jsdom
 */

import { render, waitFor } from "@testing-library/svelte";
import { tick } from "svelte";
import Markdown from "../../../../lib/components/ui/Markdown.svelte";
import { targetBlankLinkRenderer } from "../../../../lib/utils/utils";

const HTML_TEXT = "<p>demo<p>";

class Renderer {
  link: () => void;
}

describe("Markdown", () => {
  beforeEach(() => {
    globalThis.marked = {
      parse: jest.fn(() => HTML_TEXT),
      Renderer,
    };
  });

  it("should render html content", async () => {
    const { container } = render(Markdown, {
      props: { text: HTML_TEXT },
    });
    await tick();
    expect(container.querySelector("p")).toHaveTextContent("demo");
  });

  it("should render html content w/o delay when library was already loaded", () => {
    const { container } = render(Markdown, {
      props: { text: HTML_TEXT },
    });
    expect(container.querySelector("p")).toHaveTextContent("demo");
  });

  it("should render spinner until the lib is loaded", async () => {
    globalThis.marked = undefined;
    const { container, getByText } = render(Markdown, {
      props: { text: HTML_TEXT },
    });
    // lib load mock
    globalThis.marked = {
      parse: jest.fn(() => HTML_TEXT),
      Renderer,
    };

    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("circle")).toBeInTheDocument();
    await waitFor(() => getByText("demo"));
  });

  it("should render text content on script error", async () => {
    globalThis.marked = undefined;
    const { getByText } = render(Markdown, {
      props: { text: HTML_TEXT },
    });
    await tick();
    expect(getByText(HTML_TEXT)).toBeInTheDocument();
  });

  it('should "sanitize" the text', async () => {
    render(Markdown, {
      props: { text: "<script>alert('hack')</script>" },
    });
    await tick();
    expect(globalThis.marked.parse).toBeCalledWith("alert('hack')", {
      renderer: { link: targetBlankLinkRenderer },
    });
  });
});
