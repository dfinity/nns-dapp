/**
 * @jest-environment jsdom
 */

import { render, RenderResult } from "@testing-library/svelte";
import VotesCard from "../../../../lib/components/proposal-detail/VotesCard.svelte";
import { formatICP } from "../../../../lib/utils/icp.utils";
import { mockProposalInfo } from "../../../mocks/proposal.mock";

describe("VotesCard", () => {
  let renderResult: RenderResult;

  beforeEach(() => {
    renderResult = render(VotesCard, {
      props: {
        proposalInfo: mockProposalInfo,
      },
    });
  });

  it('should render "Adopt" value', () => {
    const { getByText } = renderResult;
    expect(
      getByText(
        formatICP({
          value: mockProposalInfo.latestTally.yes,
          minFraction: 2,
          maxFraction: 2,
        })
      )
    ).toBeInTheDocument();
  });

  it('should render "Reject" value', () => {
    const { getByText } = renderResult;
    expect(
      getByText(
        formatICP({
          value: mockProposalInfo.latestTally.no,
          minFraction: 2,
          maxFraction: 2,
        })
      )
    ).toBeInTheDocument();
  });

  it("should render progressbar", () => {
    const { getByRole } = renderResult;
    const progressbar = getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
    expect(progressbar.getAttribute("aria-valuemin")).toBe("0");
    expect(progressbar.getAttribute("aria-valuemax")).toBe("1000000000");
    expect(progressbar.getAttribute("aria-valuenow")).toBe("600000000");
  });
});
