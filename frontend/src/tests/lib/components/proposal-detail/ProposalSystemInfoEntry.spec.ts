import ProposalSystemInfoEntry from "$lib/components/proposal-detail/ProposalSystemInfoEntry.svelte";
import { waitFor } from "@testing-library/dom";
import { render } from "@testing-library/svelte";

// An SNS supplies the description of its topics and of its nervous system
// functions. Whoever submits an SNS proposal writes that text.
describe("ProposalSystemInfoEntry", () => {
  const renderEntry = async (description: string): Promise<HTMLElement> => {
    const { container } = render(ProposalSystemInfoEntry, {
      props: {
        label: "Topic",
        testId: "proposal-system-info-topic",
        value: "Governance",
        description,
      },
    });

    const element = container.querySelector<HTMLElement>('[data-tid="info"]');
    expect(element).not.toBeNull();

    // The Html component renders after the mount.
    await waitFor(() => expect(element.textContent).not.toBe(""));

    return element;
  };

  it("should render the description", async () => {
    const element = await renderEntry(
      'Proposals that <strong>change</strong> the <a href="https://internetcomputer.org/" target="_blank">rules</a>.'
    );

    expect(element.textContent).toContain("Proposals that change the rules.");
    expect(element.querySelector("strong").textContent).toBe("change");
    expect(element.querySelector("a").getAttribute("href")).toBe(
      "https://internetcomputer.org/"
    );
    expect(element.querySelector("a").getAttribute("rel")).toBe(
      "noopener noreferrer"
    );
  });

  it("should not render a style element or a style attribute", async () => {
    const element = await renderEntry(
      '<div><style>body{display:none}</style></div><p style="position:fixed;inset:0">Topic</p>'
    );

    expect(element.querySelectorAll("style").length).toBe(0);
    expect(element.querySelectorAll("[style]").length).toBe(0);
    expect(element.textContent).toContain("Topic");
  });

  it("should not render a form", async () => {
    const element = await renderEntry(
      '<form action="https://evil.example/"><input name="seed"><button>Claim</button></form>'
    );

    expect(element.querySelectorAll("form").length).toBe(0);
    expect(element.querySelectorAll("input").length).toBe(0);
    expect(element.querySelectorAll("button").length).toBe(0);
  });

  it("should not render an svg or an image", async () => {
    const element = await renderEntry(
      '<svg width="10" height="10"><rect width="10" height="10" /></svg>' +
        '<img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=" alt="logo">' +
        "Topic"
    );

    expect(element.querySelectorAll("svg").length).toBe(0);
    expect(element.querySelectorAll("img").length).toBe(0);
    expect(element.textContent).toContain("Topic");
  });

  it("should not render the classes of the app", async () => {
    const element = await renderEntry(
      '<p class="content-cell-island" id="fake" data-tid="proposal-summary-component">Topic</p>'
    );

    expect(element.querySelectorAll(".content-cell-island").length).toBe(0);
    expect(element.querySelectorAll("#fake").length).toBe(0);
    expect(
      element.querySelectorAll('[data-tid="proposal-summary-component"]').length
    ).toBe(0);
    expect(element.textContent).toContain("Topic");
  });
});
