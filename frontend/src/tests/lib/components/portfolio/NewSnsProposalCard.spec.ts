import NewSnsProposalCard from "$lib/components/portfolio/NewSnsProposalCard.svelte";
import { OWN_CANISTER_ID_TEXT } from "$lib/constants/canister-ids.constants";
import { NewSnsProposalCardPo } from "$tests/page-objects/NewSnsProposalCard.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import {
  type CreateServiceNervousSystem,
  type ProposalInfo,
} from "@dfinity/nns";
import { render } from "@testing-library/svelte";

describe("NewSnsProposalCard", () => {
  const mockProposal = {
    proposal: {
      title: "Proposal to create new SNS",
      summary: "",
      url: "url",
      action: {
        CreateServiceNervousSystem: {
          name: "TestDAO",
          governanceParameters: {},
          fallbackControllerPrincipalIds: [],
          logo: {},
          url: "url",
          ledgerParameters: {},
          description: "",
          dappCanisters: [],
          swapParameters: {},
          initialTokenDistribution: {},
        },
      },
    },
  } as ProposalInfo;

  const renderComponent = (proposalInfo: ProposalInfo) => {
    const { container } = render(NewSnsProposalCard, {
      props: {
        proposalInfo,
      },
    });

    return NewSnsProposalCardPo.under(new JestPageObjectElement(container));
  };

  it("should display project name and description", async () => {
    const po = renderComponent(mockProposal);
    const expectedProjectName = (
      mockProposal.proposal.action as {
        CreateServiceNervousSystem: CreateServiceNervousSystem;
      }
    ).CreateServiceNervousSystem.name;
    const expectedProposalTitle = mockProposal.proposal.title;

    expect(await po.getTitle()).toBe(expectedProjectName);
    expect(await po.getProposalTitle()).toBe(expectedProposalTitle);
  });

  it("should display percentage of yes/no", async () => {
    const po = renderComponent({
      ...mockProposal,
      latestTally: {
        yes: 100_000_000n,
        no: 200_000_000n,
        total: 300_000_000n,
        timestampSeconds: 10000000n,
      },
    });

    expect(await po.getAdoptPercentage()).toBe("33.33%");
    expect(await po.getRejectPercentage()).toBe("66.67%");
  });

  it("should display time remaining until deadline", async () => {
    const mockDate = new Date("2025-03-11T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    const oneDayLater = new Date(mockDate.getTime() + 24 * 60 * 60 * 1000);
    const deadlineTimestampSeconds = BigInt(
      Math.floor(oneDayLater.getTime() / 1000)
    );

    const po = renderComponent({
      ...mockProposal,
      deadlineTimestampSeconds,
    });

    expect(await po.getTimeRemaining()).toEqual("1 day");
  });

  it("should have proper link to project page", async () => {
    const po = renderComponent({
      ...mockProposal,
      id: 1n,
    });
    const expectedHref = `/proposal/?u=${OWN_CANISTER_ID_TEXT}&proposal=1`;

    expect(await po.getLinkPo().getHref()).toBe(expectedHref);
  });
});
