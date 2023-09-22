/**
 * @jest-environment jsdom
 */

import CommitmentProgressBar from "$lib/components/project-detail/CommitmentProgressBar.svelte";
import { render } from "@testing-library/svelte";

describe("CommitmentProgressBar", () => {
  const props = {
    directParticipation: 1500n,
    nfParticipation: 0n,
    max: BigInt(3000),
    minimumIndicator: BigInt(1500),
  };
  it("should progress bar", async () => {
    const { container } = render(CommitmentProgressBar, { props });
    expect(container.querySelector("progress")).toBeInTheDocument();
  });

  it("should display maximum and minimum indicators", async () => {
    const { queryByTestId } = render(CommitmentProgressBar, { props });
    expect(queryByTestId("commitment-max-indicator")).toBeInTheDocument();
    expect(queryByTestId("commitment-min-indicator")).toBeInTheDocument();
  });

  it("should not display minimum indicators if not provided", async () => {
    const { queryByTestId } = render(CommitmentProgressBar, {
      props: {
        directParticipation: props.directParticipation,
        nfParticipation: props.nfParticipation,
        max: props.max,
      },
    });
    expect(queryByTestId("commitment-min-indicator")).not.toBeInTheDocument();
  });

  it("should display maximum and minimum indicators values", async () => {
    const { queryByTestId } = render(CommitmentProgressBar, { props });
    expect(
      queryByTestId("commitment-max-indicator-value")?.textContent.trim()
    ).toEqual(`${Number(props.max) / 100000000} ICP`);
    expect(
      queryByTestId("commitment-min-indicator-value")?.textContent.trim()
    ).toEqual(`${Number(props.minimumIndicator) / 100000000} ICP`);
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
});
