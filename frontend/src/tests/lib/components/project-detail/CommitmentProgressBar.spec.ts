/**
 * @jest-environment jsdom
 */

import CommitmentProgressBar from "$lib/components/project-detail/CommitmentProgressBar.svelte";
import { CommitmentProgressBarPo } from "$tests/page-objects/CommitmentProgressBarPo.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { render } from "@testing-library/svelte";

describe("CommitmentProgressBar", () => {
  const props = {
    directParticipation: 1500n,
    nfParticipation: 0n,
    max: BigInt(3000),
    minimumIndicator: BigInt(1500),
  };

  const renderComponent = (props: {
    directParticipation: bigint;
    nfParticipation: bigint;
    max: bigint;
    minimumIndicator?: bigint;
  }) => {
    const { container } = render(CommitmentProgressBar, { props });
    return CommitmentProgressBarPo.under(new JestPageObjectElement(container));
  };

  it("should render direct participation value in progress bar if no NF participation", async () => {
    const po = renderComponent({
      ...props,
      directParticipation: 150_000_000n,
      nfParticipation: 0n,
    });
    expect(await po.getProgressBarValue()).toBe("150000000");
  });

  it("should render sume of direct and NF participation value in progress bar", async () => {
    const po = renderComponent({
      ...props,
      directParticipation: 300_000_000n,
      nfParticipation: 150_000_000n,
    });
    expect(await po.getProgressBarValue()).toBe("450000000");
  });

  it("should display maximum and minimum indicators", async () => {
    const po = renderComponent(props);
    expect(await po.hasMaxCommitmentIndicator()).toBe(true);
    expect(await po.hasMinCommitmentIndicator()).toBe(true);
  });

  it("should not display minimum indicators if not provided", async () => {
    const po = renderComponent({
      directParticipation: props.directParticipation,
      nfParticipation: props.nfParticipation,
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

  it("should display NF and direct commitments", async () => {
    const nfParticipation = 500n;
    const { container } = render(CommitmentProgressBar, {
      props: {
        ...props,
        nfParticipation,
      },
    });
    expect(container.querySelector("progress").value).toBe(
      Number(props.directParticipation + nfParticipation)
    );
    expect(container.querySelector("progress").style.cssText).toBe(
      "--progress-bar-background: linear-gradient(to right, var(--positive-emphasis) 0% 25%, var(--warning-emphasis) 25% 100%);"
    );
  });

  it("should display only direct commitment if no NF commitment", async () => {
    const po = renderComponent({
      ...props,
      directParticipation: 300_000_000n,
      nfParticipation: 0n,
    });
    expect(await po.getNFCommitmentPercentage()).toEqual(0);
    expect(await po.getDirectCommitmentPercentage()).toEqual(100);
  });

  it("should display NF and direct commitments", async () => {
    const po = renderComponent({
      ...props,
      directParticipation: 300_000_000n,
      nfParticipation: 100_000_000n,
    });
    expect(await po.getNFCommitmentPercentage()).toEqual(25);
    expect(await po.getDirectCommitmentPercentage()).toEqual(75);
  });
});
