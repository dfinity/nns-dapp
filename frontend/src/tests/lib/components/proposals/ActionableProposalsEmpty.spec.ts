import ActionableProposalsEmpty from "$lib/components/proposals/ActionableProposalsEmpty.svelte";
import { actionableSnsProposalsStore } from "$lib/stores/actionable-sns-proposals.store";
import { principal } from "$tests/mocks/sns-projects.mock";
import { PageBannerPo } from "$tests/page-objects/PageBanner.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { allowLoggingInOneTestForDebugging } from "$tests/utils/console.test-utils";
import { resetSnsProjects, setSnsProjects } from "$tests/utils/sns.test-utils";
import { render } from "$tests/utils/svelte.test-utils";
import { SnsSwapLifecycle } from "@dfinity/sns";

describe("ActionableProposalsEmpty", () => {
  const addSnsesWithSupport = (includeBallotsByCallerList: boolean[]) => {
    const snsProjects = Array.from(
      new Array(includeBallotsByCallerList.length)
    ).map((_, i) => ({
      lifecycle: SnsSwapLifecycle.Committed,
      rootCanisterId: principal(i),
      projectName: `SNS-${i}`,
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
    const { container } = render(ActionableProposalsEmpty);

    return PageBannerPo.under({
      element: new JestPageObjectElement(container),
      testId: "actionable-proposals-empty",
    });
  };

  beforeEach(() => {
    resetSnsProjects();
    actionableSnsProposalsStore.resetForTesting();
    allowLoggingInOneTestForDebugging();
  });

  it("should display a title", async () => {
    addSnsesWithSupport([true]);
    const po = renderComponent();
    expect(await po.getTitleText()).toEqual("You're all caught up.");
  });

  it("should display a static text when there is no unsupported Snses", async () => {
    addSnsesWithSupport([true]);
    const po = renderComponent();
    expect(await po.getDescriptionText()).toEqual("Check back later!");
  });

  it("should display an unsupported Sns name in description", async () => {
    addSnsesWithSupport([false]);
    const po = renderComponent();
    expect(await po.getDescriptionText()).toEqual(
      "Check back later! Note, that not all SNS DAOs support actionable proposals. You will need to check proposals manually if you hold SNS-0 neurons."
    );
  });

  it("should display multiple unsupported Sns names in description", async () => {
    addSnsesWithSupport([false, true, false, true, false]);
    const po = renderComponent();
    expect(await po.getDescriptionText()).toEqual(
      "Check back later! Note, that not all SNS DAOs support actionable proposals. You will need to check proposals manually if you hold SNS-0, SNS-2 or SNS-4 neurons."
    );
  });
});
