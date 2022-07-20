/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import CommitmentProgressBar from "../../../../lib/components/project-detail/CommitmentProgressBar.svelte";

describe("CommitmentProgressBar", () => {
  const props = {
    value: BigInt(1327),
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
        value: props.value,
        max: props.max,
      },
    });
    expect(queryByTestId("commitment-min-indicator")).not.toBeInTheDocument();
  });

  it("should display maximum and minimum indicators values", async () => {
    const { queryByTestId } = render(CommitmentProgressBar, { props });
    expect(
      queryByTestId("commitment-max-indicator-value")?.textContent
    ).toEqual(`${Number(props.max) / 100000000} ICP`);
    expect(
      queryByTestId("commitment-min-indicator-value")?.textContent
    ).toEqual(`${Number(props.minimumIndicator) / 100000000} ICP`);
  });
});
