import * as proposalsApi from "$lib/api/proposals.api";
import ProjectProposal from "$lib/components/project-detail/ProjectProposal.svelte";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { createSummary } from "$tests/mocks/sns-projects.mock";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { render } from "@testing-library/svelte";

vi.mock("$lib/api/proposals.api");

const blockedApiPaths = ["$lib/api/proposals.api"];
describe("ProjectProposal", () => {
  blockAllCallsTo(blockedApiPaths);

  beforeEach(() => {
    vi.spyOn(proposalsApi, "queryProposal").mockResolvedValue(mockProposalInfo);
  });

  it("should show a proposal card from the proposal id", async () => {
    const { queryByTestId } = render(ProjectProposal, {
      props: {
        summary: createSummary({
          nnsProposalId: mockProposalInfo.id,
        }),
      },
    });

    await runResolvedPromises();

    expect(queryByTestId("proposal-card")).toBeInTheDocument();
  });

  it("should not show a proposal card if no nns proposal id", async () => {
    const { queryByTestId } = render(ProjectProposal, {
      props: {
        summary: createSummary({
          nnsProposalId: undefined,
        }),
      },
    });

    await runResolvedPromises();

    expect(queryByTestId("proposal-card")).not.toBeInTheDocument();
  });
});
