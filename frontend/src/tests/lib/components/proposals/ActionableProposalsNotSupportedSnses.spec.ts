import ActionableProposalsNotSupportedSnses from "$lib/components/proposals/ActionableProposalsNotSupportedSnses.svelte";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { principal } from "$tests/mocks/sns-projects.mock";
import { ActionableProposalsNotSupportedSnsesPo } from "$tests/page-objects/ActionableProposalsNotSupportedSnses.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { allowLoggingInOneTestForDebugging } from "$tests/utils/console.test-utils";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { render } from "$tests/utils/svelte.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";

describe("ActionableProposalsNotSupportedSnses", () => {
  const addSnsesWithSupport = (includeBallotsByCallerList: boolean[]) => {
    const snsProjects = Array.from(
      new Array(includeBallotsByCallerList.length)
    ).map((_, i) => ({
      lifecycle: SnsSwapLifecycle.Committed,
      rootCanisterId: principal(i),
    }));
    setSnsProjects(snsProjects);

    Array.from(new Array(includeBallotsByCallerList.length)).forEach((_, i) =>
      actionableSnsProposalsStore.set({
        rootCanisterId: principal(i),
        proposals: [],
        includeBallotsByCaller: includeBallotsByCallerList[i],
      })
    );
  };

  const renderComponent = () => {
    const { container } = render(ActionableProposalsNotSupportedSnses);

    return ActionableProposalsNotSupportedSnsesPo.under(
      new JestPageObjectElement(container)
    );
  };

  beforeEach(() => {
    resetSnsProjects();
    actionableSnsProposalsStore.resetForTesting();
    allowLoggingInOneTestForDebugging();
  });

  it("should be rendered when there are Snses w/o actionable support", async () => {
    addSnsesWithSupport([false]);
    const po = renderComponent();
    expect(await po.getBannerPo().isPresent()).toEqual(true);
  });

  it("should be hidden when all Snses supports actionable proposals", async () => {
    addSnsesWithSupport([true]);
    const po = renderComponent();
    expect(await po.getBannerPo().isPresent()).toEqual(false);
  });

  it("should be hidden when there are no Snses", async () => {
    const po = renderComponent();
    expect(await po.getBannerPo().isPresent()).toEqual(false);
  });

  it("should not render the banner when no Snses that doesn't support actionable", async () => {
    const po = renderComponent();
    expect(await po.getBannerPo().isPresent()).toEqual(true);
  });

  it("should display title", async () => {
    addSnsesWithSupport([false, false]);
    const po = renderComponent();
    expect(await po.getBannerPo().getTitleText()).toEqual(
      "Catalyze, Catalyze don’t yet support actionable proposals."
    );
  });

  it("should display description", async () => {
    addSnsesWithSupport([false]);
    const po = renderComponent();
    expect(await po.getBannerPo().getDescriptionText()).toEqual(
      "If an SNS DAO wishes to support actionable proposals, need to upgrade to a newer version of the SNS governance canister."
    );
  });
});
