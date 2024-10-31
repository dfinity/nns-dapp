import Hash from "$lib/components/ui/Hash.svelte";
import { HashPo } from "$tests/page-objects/Hash.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("Hash", () => {
  const identifier = "12345678901234567890";
  const shortenedIdentifier = "1234567...4567890";
  const testId = "tests-hash";

  const renderComponent = (props) => {
    const { container } = render(Hash, props);
    return HashPo.under(new JestPageObjectElement(container));
  };

  it("should render a hashed identifier", async () => {
    const po = renderComponent({
      props: { text: identifier, testId, id: identifier },
    });

    expect(await po.getDisplayedText()).toEqual(shortenedIdentifier);
  });

  it("should use the splitLength prop", async () => {
    const splitLength = 3;
    const po = renderComponent({
      props: { text: identifier, testId, id: identifier, splitLength },
    });

    expect(await po.getDisplayedText()).toEqual("123...890");
  });

  it("should render a tooltip with full identifier", async () => {
    const po = renderComponent({
      props: { text: identifier, testId, id: identifier },
    });

    expect(await po.getTooltipPo().getTooltipText()).toBe(identifier);
  });

  it("should render the identifier as aria-label when copy icon", async () => {
    const po = renderComponent({
      props: { text: identifier, testId, id: identifier, showCopy: true },
    });

    expect(await po.getCopyButtonPo().getAriaLabel()).toBe(
      `Copy to clipboard: ${identifier}`
    );
  });
});
