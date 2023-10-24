import ProjectCardSwapInfo from "$lib/components/launchpad/ProjectCardSwapInfo.svelte";
import { SECONDS_IN_DAY } from "$lib/constants/constants";
import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
import { createMockSnsFullProject } from "$tests/mocks/sns-projects.mock";
import { rootCanisterIdMock } from "$tests/mocks/sns.api.mock";
import { ProjectCardSwapInfoPo } from "$tests/page-objects/ProjectCardSwapInfo.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

describe("ProjectCardSwapInfo", () => {
  const rootCanisterId = rootCanisterIdMock;
  const now = Date.now();
  const nowInSeconds = Math.ceil(now / 1000);

  const renderCard = (props: {
    project: SnsFullProject;
    isFinalizing: boolean;
  }) => {
    const { container } = render(ProjectCardSwapInfo, { props });
    return ProjectCardSwapInfoPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    vitest.useFakeTimers().setSystemTime(now);
  });

  it("should render deadline", async () => {
    const project = createMockSnsFullProject({
      rootCanisterId,
      summaryParams: {
        lifecycle: SnsSwapLifecycle.Open,
        swapDueTimestampSeconds: BigInt(nowInSeconds + SECONDS_IN_DAY),
      },
    });
    const po = renderCard({
      project,
      isFinalizing: false,
    });

    expect(await po.getStatus()).toBe("Deadline 1 day");
  });

  it("should render starting time", async () => {
    const project = createMockSnsFullProject({
      rootCanisterId,
      summaryParams: {
        lifecycle: SnsSwapLifecycle.Adopted,
        swapOpenTimestampSeconds: BigInt(nowInSeconds + SECONDS_IN_DAY),
      },
    });
    const po = renderCard({
      project,
      isFinalizing: false,
    });

    expect(await po.getStatus()).toBe("Starts in 1 day");
  });

  it("should render my commitment", async () => {
    const project = createMockSnsFullProject({
      rootCanisterId,
      summaryParams: {
        lifecycle: SnsSwapLifecycle.Committed,
      },
      icpCommitment: 314000000n,
    });
    const po = renderCard({
      project,
      isFinalizing: false,
    });

    expect(await po.getUserCommitment()).toBe("3.14 ICP");
  });

  it("should not render my commitment if `undefined`", async () => {
    const project = createMockSnsFullProject({
      rootCanisterId,
      summaryParams: {
        lifecycle: SnsSwapLifecycle.Committed,
      },
      icpCommitment: undefined,
    });
    const po = renderCard({
      project,
      isFinalizing: false,
    });

    expect(await po.hasUserCommitment()).toBe(false);
  });

  it("should render completed", async () => {
    const project = createMockSnsFullProject({
      rootCanisterId,
      summaryParams: {
        lifecycle: SnsSwapLifecycle.Committed,
      },
    });
    const po = renderCard({
      project,
      isFinalizing: false,
    });

    expect(await po.getStatus()).toBe("Status Completed");
  });

  it("should render finalizing", async () => {
    const project = createMockSnsFullProject({
      rootCanisterId,
      summaryParams: {
        lifecycle: SnsSwapLifecycle.Committed,
      },
    });
    const po = renderCard({
      project,
      isFinalizing: true,
    });

    expect(await po.getStatus()).toBe("Status Finalizing");
  });
});
