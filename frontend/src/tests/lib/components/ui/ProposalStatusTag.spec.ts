import ProposalStatusTag from "$lib/components/ui/ProposalStatusTag.svelte";
import type { UniversalProposalStatus } from "$lib/types/proposals";
import { ProposalStatusTagPo } from "$tests/page-objects/ProposalStatusTag.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("ProposalStatusTag", () => {
  const renderComponent = (status: UniversalProposalStatus) => {
    const { container } = render(ProposalStatusTag, {
      props: { status },
    });

    return ProposalStatusTagPo.under(new JestPageObjectElement(container));
  };

  it('should render status "unknown"', async () => {
    const po = await renderComponent("unknown");
    expect(await po.getText()).toEqual("Unknown");
    expect(await po.hasStatusClass("unknown")).toBe(true);
  });

  it('should render status "open"', async () => {
    const po = await renderComponent("open");
    expect(await po.getText()).toEqual("Open");
    expect(await po.hasStatusClass("open")).toBe(true);
  });

  it('should render status "rejected"', async () => {
    const po = await renderComponent("rejected");
    expect(await po.getText()).toEqual("Rejected");
    expect(await po.hasStatusClass("rejected")).toBe(true);
  });

  it('should render status "adopted"', async () => {
    const po = await renderComponent("adopted");
    expect(await po.getText()).toEqual("Adopted");
    expect(await po.hasStatusClass("adopted")).toBe(true);
  });

  it('should render status "executed"', async () => {
    const po = await renderComponent("executed");
    expect(await po.getText()).toEqual("Executed");
    expect(await po.hasStatusClass("executed")).toBe(true);
  });

  it('should render status "failed"', async () => {
    const po = await renderComponent("failed");
    expect(await po.getText()).toEqual("Failed");
    expect(await po.hasStatusClass("failed")).toBe(true);
  });
});
