import ProposalStatusTag from "$lib/components/ui/ProposalStatusTag.svelte";
import { ProposalStatusTagPo } from "$tests/page-objects/ProposalStatusTag.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "$tests/utils/svelte.test-utils";

describe("ProposalStatusTag", () => {
  const renderComponent = (props) => {
    const { container } = render(ProposalStatusTag, {
      props,
    });

    return ProposalStatusTagPo.under(new JestPageObjectElement(container));
  };

  it('should render status "unknown"', async () => {
    const po = await renderComponent({ status: "unknown" });
    expect(await po.getText()).toEqual("Unknown");
    expect(await po.hasStatusClass("unknown")).toBe(true);
  });

  it('should render status "open"', async () => {
    const po = await renderComponent({ status: "open" });
    expect(await po.getText()).toEqual("Open");
    expect(await po.hasStatusClass("open")).toBe(true);
  });

  it('should render status "rejected"', async () => {
    const po = await renderComponent({ status: "rejected" });
    expect(await po.getText()).toEqual("Rejected");
    expect(await po.hasStatusClass("rejected")).toBe(true);
  });

  it('should render status "adopted"', async () => {
    const po = await renderComponent({ status: "adopted" });
    expect(await po.getText()).toEqual("Adopted");
    expect(await po.hasStatusClass("adopted")).toBe(true);
  });

  it('should render status "executed"', async () => {
    const po = await renderComponent({ status: "executed" });
    expect(await po.getText()).toEqual("Executed");
    expect(await po.hasStatusClass("executed")).toBe(true);
  });

  it('should render status "failed"', async () => {
    const po = await renderComponent({ status: "failed" });
    expect(await po.getText()).toEqual("Failed");
    expect(await po.hasStatusClass("failed")).toBe(true);
  });

  it("should render actionable mark", async () => {
    const po = await renderComponent({ status: "open", actionable: true });
    expect(await po.hasActionableMark()).toBe(true);

    const po2 = await renderComponent({ status: "open" });
    expect(await po2.hasActionableMark()).toBe(false);
  });
});
