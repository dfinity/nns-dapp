/**
 * @jest-environment jsdom
 */

import type { ProposalInfo } from "@dfinity/nns";
import { fireEvent, render } from "@testing-library/svelte";
import ProposalCard from "../../../../lib/components/launchpad/ProposalCard.svelte";
import { AppPath } from "../../../../lib/constants/routes.constants";
import { routeStore } from "../../../../lib/stores/route.store";
import {
  nowInSeconds,
  secondsToDuration,
} from "../../../../lib/utils/date.utils";
import { mapProposalInfo } from "../../../../lib/utils/proposals.utils";
import en from "../../../mocks/i18n.mock";
import { mockProposalInfo } from "../../../mocks/proposal.mock";

describe("ProposalCard", () => {
  const proposalId = BigInt(12345);
  const proposalInfo = {
    ...mockProposalInfo,
    id: proposalId,
  } as ProposalInfo;
  const { title = "404", id } = mapProposalInfo(proposalInfo);

  it("should render a title", () => {
    const { getByText } = render(ProposalCard, {
      props: {
        proposalInfo,
      },
    });

    expect(getByText(title)).toBeInTheDocument();
  });

  it("should render proposal id", () => {
    const { getByText } = render(ProposalCard, {
      props: {
        proposalInfo,
      },
    });

    expect(getByText(title)).toBeInTheDocument();
  });

  describe("deadline fields", () => {
    const now = BigInt(nowInSeconds());
    const deadlineIn = BigInt(1000);

    beforeAll(() => {
      jest.useFakeTimers("modern").setSystemTime(Date.now());
    });

    afterAll(() => jest.useRealTimers());

    it("should render proposal deadline", () => {
      const { getByText } = render(ProposalCard, {
        props: {
          proposalInfo: {
            ...proposalInfo,
            deadlineTimestampSeconds: now + deadlineIn,
          },
        },
      });

      expect(
        getByText(en.proposal_detail.open_voting_prefix)
      ).toBeInTheDocument();

      expect(getByText(secondsToDuration(deadlineIn))).toBeInTheDocument();
    });

    it("should not render proposal deadline when in past", () => {
      const { queryByText } = render(ProposalCard, {
        props: {
          proposalInfo: {
            ...proposalInfo,
            deadlineTimestampSeconds: now - deadlineIn,
          },
        },
      });

      expect(queryByText(en.proposal_detail.open_voting_prefix)).toBeNull();

      expect(queryByText(secondsToDuration(deadlineIn))).toBeNull();
    });
  });

  it("navigate to proposal", async () => {
    const { getByTestId } = render(ProposalCard, {
      props: {
        proposalInfo,
      },
    });

    const spyOnNavigate = jest.spyOn(routeStore, "navigate");

    await fireEvent.click(getByTestId("vote-for-sns"));

    expect(spyOnNavigate).toBeCalledWith({
      path: `${AppPath.ProposalDetail}/${id}`,
    });
  });
});
