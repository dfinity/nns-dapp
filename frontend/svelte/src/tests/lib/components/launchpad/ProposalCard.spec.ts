/**
 * @jest-environment jsdom
 */

import type { ProposalInfo } from "@dfinity/nns";
import { fireEvent, render } from "@testing-library/svelte";
import ProposalCard from "../../../../lib/components/launchpad/ProposalCard.svelte";
import { AppPath } from "../../../../lib/constants/routes.constants";
import { routeStore } from "../../../../lib/stores/route.store";
import { mapProposalInfo } from "../../../../lib/utils/proposals.utils";
import { mockProposalInfo } from "../../../mocks/proposal.mock";

describe("ProposalCard", () => {
  const proposalInfo = { ...mockProposalInfo } as ProposalInfo;
  const { title = "404", id } = mapProposalInfo(proposalInfo);

  it("should render a title", () => {
    const { getByText } = render(ProposalCard, {
      props: {
        proposalInfo,
      },
    });

    expect(getByText(title)).toBeInTheDocument();
  });

  it("navigate to proposal", async () => {
    const { getByTestId } = render(ProposalCard, {
      props: {
        proposalInfo,
      },
    });

    const spyOnNavigate = jest.spyOn(routeStore, "navigate");

    await fireEvent.click(getByTestId("sns-proposal-card"));

    expect(spyOnNavigate).toBeCalledWith({
      path: `${AppPath.ProposalDetail}/${id}`,
    });
  });
});
