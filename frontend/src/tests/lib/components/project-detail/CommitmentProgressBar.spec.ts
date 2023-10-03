/**
 * @jest-environment jsdom
 */

import CommitmentProgressBar from "$lib/components/project-detail/CommitmentProgressBar.svelte";
import { CommitmentProgressBarPo } from "$tests/page-objects/CommitmentProgressBarPo.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("CommitmentProgressBar", () => {
  const props = {
    participationE8s: 1500n,
    max: BigInt(3000),
    minimumIndicator: BigInt(1500),
  };

  const renderComponent = (props: {
    participationE8s: bigint;
    max: bigint;
    minimumIndicator?: bigint;
  }) => {
    const { container } = render(CommitmentProgressBar, { props });
    return CommitmentProgressBarPo.under(new JestPageObjectElement(container));
  };

  it("should render direct participation value in progress bar if no NF participation", async () => {
    const po = renderComponent({
      ...props,
      participationE8s: 150_000_000n,
    });
    expect(await po.getCommitmentE8s()).toBe(150000000n);
  });

  it("should display maximum and minimum indicators", async () => {
    const po = renderComponent(props);
    expect(await po.hasMaxCommitmentIndicator()).toBe(true);
    expect(await po.hasMinCommitmentIndicator()).toBe(true);
  });

  it("should not display minimum indicators if not provided", async () => {
    const po = renderComponent({
      participationE8s: props.participationE8s,
      max: props.max,
    });
    expect(await po.hasMinCommitmentIndicator()).toBe(false);
  });

  it("should display maximum and minimum indicators values", async () => {
    const po = renderComponent({
      ...props,
      max: 3_000_000_000n,
      minimumIndicator: 150_000_000n,
    });
    expect(await po.getMinCommitment()).toBe("1.50 ICP");
    expect(await po.getMaxCommitment()).toBe("30.00 ICP");
  });
});
