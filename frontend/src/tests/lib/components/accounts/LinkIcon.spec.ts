import LinkIcon from "$lib/components/common/LinkIcon.svelte";
import { LinkIconPo } from "$tests/page-objects/LinkIcon.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("LinkIcon", () => {
  const renderComponent = (props) => {
    const { container } = render(LinkIcon, {
      props,
    });
    return LinkIconPo.under(new JestPageObjectElement(container));
  };

  it("should have href attribute", async () => {
    const po = renderComponent({
      href: "http://test.com",
    });

    expect(await po.getHref()).toEqual("http://test.com");
  });
});
