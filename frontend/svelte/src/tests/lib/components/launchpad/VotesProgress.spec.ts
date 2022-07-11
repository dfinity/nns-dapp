/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/svelte";
import VotesProgress from "../../../../lib/components/launchpad/VotesProgress.svelte";
import { E8S_PER_ICP } from "../../../../lib/constants/icp.constants";
import { formatNumber } from "../../../../lib/utils/format.utils";
import { mockProposalInfo } from "../../../mocks/proposal.mock";

describe("VotesProgress", () => {
  const yes = BigInt(1600000000);
  const yesNumber = Number(yes) / E8S_PER_ICP;
  const no = BigInt(400000000);
  const noNumber = Number(no) / E8S_PER_ICP;

  it('should render "Adopt" value', () => {
    const { getByText } = render(VotesProgress, {
      props: {
        proposalInfo: {
          ...mockProposalInfo,
          latestTally: {
            no,
            yes,
          },
        },
      },
    });

    expect(getByText(`${formatNumber(yesNumber)}`)).toBeInTheDocument();
  });

  it('should render "Reject" value', () => {
    const { getByText } = render(VotesProgress, {
      props: {
        proposalInfo: {
          ...mockProposalInfo,
          latestTally: {
            no,
            yes,
          },
        },
      },
    });

    expect(getByText(`${formatNumber(noNumber)}`)).toBeInTheDocument();
  });

  it("should render progressbar with aria values", () => {
    const { getByRole } = render(VotesProgress, {
      props: {
        proposalInfo: {
          ...mockProposalInfo,
          latestTally: {
            no,
            yes,
          },
        },
      },
    });

    const progressbar = getByRole("progressbar");
    expect(progressbar).toBeInTheDocument();
    expect(progressbar.getAttribute("aria-valuemin")).toBe("0");
    expect(progressbar.getAttribute("aria-valuemax")).toBe(
      `${yesNumber + noNumber}`
    );
    expect(progressbar.getAttribute("aria-valuenow")).toBe(`${yesNumber}`);
  });
});
