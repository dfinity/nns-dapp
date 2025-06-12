import * as api from "$lib/api/proposals.api";
import * as proposalsApi from "$lib/api/proposals.api";
import ProjectProposal from "$lib/components/project-detail/ProjectProposal.svelte";
import { setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { createSummary } from "$tests/mocks/sns-projects.mock";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { render } from "@testing-library/svelte";
import { tick } from "svelte";
import { get } from "svelte/store";

vi.mock("$lib/api/proposals.api");

const blockedApiPaths = ["$lib/api/proposals.api"];
describe("ProjectProposal", () => {
  blockAllCallsTo(blockedApiPaths);

  beforeEach(() => {
    setNoIdentity();
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
    expect(get(toastsStore)).toEqual([]);
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

  it("should show an info-box card if there is a proposalId and there was an error fetching the proposal information", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(api, "queryProposal").mockRejectedValue(new Error());

    const { queryByTestId } = render(ProjectProposal, {
      props: {
        summary: createSummary({
          nnsProposalId: mockProposalInfo.id,
        }),
      },
    });

    await tick();

    expect(queryByTestId("proposal-card")).not.toBeInTheDocument();

    await tick();

    expect(queryByTestId("proposal-card-alternative-info")).toBeInTheDocument();
  });
});
