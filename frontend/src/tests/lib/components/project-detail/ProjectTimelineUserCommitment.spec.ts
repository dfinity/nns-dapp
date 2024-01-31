import ProjectTimelineUserCommitment from "$lib/components/project-detail/ProjectTimelineUserCommitment.svelte";
import { SECONDS_IN_DAY } from "$lib/constants/constants";
import type { SnsSwapCommitment } from "$lib/types/sns";
import {
  durationTillSwapDeadline,
  durationTillSwapStart,
} from "$lib/utils/projects.utils";
import en from "$tests/mocks/i18n.mock";
import {
  createSummary,
  mockSnsFullProject,
  summaryForLifecycle,
} from "$tests/mocks/sns-projects.mock";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { ICPToken, TokenAmount, secondsToDuration } from "@dfinity/utils";
import { render } from "@testing-library/svelte";

describe("ProjectTimelineUserCommitment", () => {
  const now = Date.now();
  beforeEach(() => {
    vi.useFakeTimers().setSystemTime(now);
  });

  it("should render deadline if status Open", () => {
    const summary = summaryForLifecycle(SnsSwapLifecycle.Open);
    const { queryByText } = render(ProjectTimelineUserCommitment, {
      props: {
        summary: summary,
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        myCommitment: undefined,
      },
    });
    expect(queryByText(en.sns_project_detail.deadline)).toBeInTheDocument();

    const expectedDeadline = secondsToDuration({
      seconds: durationTillSwapDeadline(summary.swap) as bigint,
    });
    expect(queryByText(expectedDeadline)).toBeInTheDocument();
  });

  it("should render starting info if status Adopted", () => {
    const summaryData = summaryForLifecycle(SnsSwapLifecycle.Adopted);
    const summary = {
      ...summaryData,
      swap: {
        ...summaryData.swap,
        decentralization_sale_open_timestamp_seconds: BigInt(
          now + SECONDS_IN_DAY
        ),
      },
    };
    const { queryByText } = render(ProjectTimelineUserCommitment, {
      summary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      myCommitment: undefined,
    });
    expect(queryByText(en.sns_project_detail.starts)).toBeInTheDocument();

    const expectedStartingInfo = secondsToDuration({
      seconds: durationTillSwapStart(summary.swap),
    });
    expect(queryByText(expectedStartingInfo)).toBeInTheDocument();
  });

  it("should render user commitment", () => {
    const summary = createSummary({
      lifecycle: SnsSwapLifecycle.Open,
    });
    const myCommitment = TokenAmount.fromString({
      amount: "3.14",
      token: ICPToken,
    }) as TokenAmount;
    const { queryByTestId } = render(ProjectTimelineUserCommitment, {
      summary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      myCommitment,
    });
    expect(
      queryByTestId("sns-user-commitment").querySelector(
        "[data-tid='token-value-label']"
      )?.textContent
    ).toBe("3.14 ICP");
  });

  it("should not render anything if no user commitment and not open nor adopted", () => {
    const summary = createSummary({
      lifecycle: SnsSwapLifecycle.Committed,
    });

    const { container } = render(ProjectTimelineUserCommitment, {
      summary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      myCommitment: undefined,
    });
    expect(container.textContent.trim()).toBe("");
  });
});
