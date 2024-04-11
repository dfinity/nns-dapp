import IdentifierHash from "$lib/components/ui/IdentifierHash.svelte";
import { IdentifierHashPo } from "$tests/page-objects/IdentifierHash.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("IdentifierHash", () => {
  const identifier = "12345678901234567890";

  const renderComponent = (props) => {
    // By default, render() reuses the container element between different calls
    // from the same test.
    const container = document.createElement("div");
    document.body.appendChild(container);
    render(IdentifierHash, props, { container });
    return IdentifierHashPo.under(new JestPageObjectElement(container));
  };

  it("should render a hashed identifier", async () => {
    const po = renderComponent({ identifier: "12345678901234567890" });

    expect(await po.getDisplayedText()).toBe("1234567...4567890");
    expect(await po.getFullText()).toBe("12345678901234567890");
  });

  it("should render the identifier as aria-label", async () => {
    const po = renderComponent({ identifier });

    expect(await po.getCopyButtonPo().getAriaLabel()).toBe(
      `Copy to clipboard: ${identifier}`
    );
  });

  it("should use a unique tooltip ID each time", async () => {
    const po1 = renderComponent({ identifier });
    const po2 = renderComponent({ identifier });

    const id1 = await po1.getTooltipPo().getTooltipId();
    const id2 = await po2.getTooltipPo().getTooltipId();

    expect(id1).toMatch(/^identifier-\d+$/);
    expect(id2).toMatch(/^identifier-\d+$/);

    expect(id1).not.toBe(id2);
  });
});
