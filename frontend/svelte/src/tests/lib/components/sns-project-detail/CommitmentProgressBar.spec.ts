/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import CommitmentProgressBar from "../../../../lib/components/sns-project-detail/CommitmentProgressBar.svelte";

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

  it("should maximum and minimum indicators", async () => {
    const { queryByTestId } = render(CommitmentProgressBar, { props });
    expect(queryByTestId("commitment-max-indicator")).toBeInTheDocument();
    expect(queryByTestId("commitment-min-indicator")).toBeInTheDocument();
  });
});
