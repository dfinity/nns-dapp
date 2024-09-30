import * as proposalsApi from "$lib/api/proposals.api";
import ProjectProposal from "$lib/components/project-detail/ProjectProposal.svelte";
import { resetIdentity, setNoIdentity } from "$tests/mocks/auth.store.mock";
import { mockProposalInfo } from "$tests/mocks/proposal.mock";
import { createSummary } from "$tests/mocks/sns-projects.mock";
import { blockAllCallsTo } from "$tests/utils/module.test-utils";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import { toastsStore } from "@dfinity/gix-components";
import { render } from "@testing-library/svelte";
import { get } from "svelte/store";

vi.mock("$lib/api/proposals.api");

const blockedApiPaths = ["$lib/api/proposals.api"];
describe("ProjectProposal", () => {
  blockAllCallsTo(blockedApiPaths);

  beforeEach(() => {
    vi.restoreAllMocks();
    toastsStore.reset();
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

  it("should show a toast if proposal fails to load while signed out", async () => {
    setNoIdentity();
    const errorMessage = "Failed to load proposal";
    vi.spyOn(console, "error").mockReturnValue(undefined);
    vi.spyOn(proposalsApi, "queryProposal").mockRejectedValue(
      new Error(errorMessage)
    );

    expect(get(toastsStore)).toEqual([]);

    const { queryByTestId } = render(ProjectProposal, {
      props: {
        summary: createSummary({
          nnsProposalId: mockProposalInfo.id,
        }),
      },
    });
    await runResolvedPromises();

    expect(queryByTestId("proposal-card")).toBeNull();
    expect(get(toastsStore)).toMatchObject([
      {
        level: "error",
        text: `An error occurred while loading the proposal. id: "${mockProposalInfo.id}". ${errorMessage}`,
      },
    ]);
  });

  it("should show a toast if proposal fails to load while signed in", async () => {
    resetIdentity();
    const errorMessage = "Failed to load proposal";
    vi.spyOn(console, "error").mockReturnValue(undefined);
    vi.spyOn(proposalsApi, "queryProposal").mockRejectedValue(
      new Error(errorMessage)
    );

    expect(get(toastsStore)).toEqual([]);

    const { queryByTestId } = render(ProjectProposal, {
      props: {
        summary: createSummary({
          nnsProposalId: mockProposalInfo.id,
        }),
      },
    });
    await runResolvedPromises();

    expect(queryByTestId("proposal-card")).toBeNull();
    expect(get(toastsStore)).toMatchObject([
      {
        level: "error",
        text: `An error occurred while loading the proposal. id: "${mockProposalInfo.id}". ${errorMessage}`,
      },
    ]);
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
