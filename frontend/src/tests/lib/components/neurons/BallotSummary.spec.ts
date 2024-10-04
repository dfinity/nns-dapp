import * as agent from "$lib/api/agent.api";
import BallotSummary from "$lib/components/neuron-detail/Ballots/BallotSummary.svelte";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { MockGovernanceCanister } from "$tests/mocks/governance.canister.mock";
import { mockProposals } from "$tests/mocks/proposals.store.mock";
import { BallotSummaryPo } from "$tests/page-objects/BallotSummary.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { silentConsoleErrors } from "$tests/utils/utils.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import type { BallotInfo } from "@dfinity/nns";
import { GovernanceCanister, Vote } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { mock } from "vitest-mock-extended";

describe("BallotSummary", () => {
  const mockBallot: BallotInfo = {
    vote: Vote.Yes,
    proposalId: mockProposals[0].id,
  };

  const mockGovernanceCanister: MockGovernanceCanister =
    new MockGovernanceCanister(mockProposals);

  beforeEach(() => {
    silentConsoleErrors();

    vi.spyOn(GovernanceCanister, "create").mockImplementation(
      (): GovernanceCanister => mockGovernanceCanister
    );

    resetIdentity();
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  const renderComponent = async (ballot) => {
    const { container } = render(BallotSummary, {
      props: {
        ballot: {
          ...mockBallot,
          ...ballot,
        },
      },
    });
    await runResolvedPromises();
    return BallotSummaryPo.under(new JestPageObjectElement(container));
  };

  it("should render proposal id", async () => {
    const po = await renderComponent({});
    expect(await po.getProposalId()).toBe(`${mockProposals[0].id}`);
  });

  it("should render proposal summary", async () => {
    const po = await renderComponent({});
    await po.waitForLoaded();

    expect(await po.getBallotSummary()).toBe(mockProposals[0].proposal.summary);
  });

  it("should render ballot vote yes", async () => {
    const po = await renderComponent({
      vote: Vote.Yes,
    });
    expect(await po.getVote()).toBe("Yes");
  });

  it("should render ballot vote no", async () => {
    const po = await renderComponent({
      vote: Vote.No,
    });
    expect(await po.getVote()).toBe("No");
  });

  it("should render ballot vote unspecified", async () => {
    const po = await renderComponent({
      vote: Vote.Unspecified,
    });
    expect(await po.getVote()).toBe("Unspecified");
  });

  it("should show ballot summary on info click", async () => {
    const po = await renderComponent({});
    await po.waitForLoaded();

    await runResolvedPromises();
    expect(await po.isBallotSummaryVisible()).toBe(false);

    po.clickInfoIcon();

    await runResolvedPromises();
    expect(await po.isBallotSummaryVisible()).toBe(true);

    await waitFor(async () =>
      expect(await po.getBallotSummary()).toBe(
        "Initialize datacenter records. For more info about this proposal, read the forum announcement: https://forum.dfinity.org/t/improvements-to-node-provider-remuneration/10553"
      )
    );
  });
});
