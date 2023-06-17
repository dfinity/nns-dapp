/**
 * @jest-environment jsdom
 */

import ProjectCardSwapInfo from "$lib/components/launchpad/ProjectCardSwapInfo.svelte";
import { SECONDS_IN_DAY } from "$lib/constants/constants";
import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
import type { SnsSwapCommitment } from "$lib/types/sns";
import { secondsToDuration } from "$lib/utils/date.utils";
import { getCommitmentE8s } from "$lib/utils/sns.utils";
import { formatToken } from "$lib/utils/token.utils";
import en from "$tests/mocks/i18n.mock";
import {
  mockSnsFullProject,
  summaryForLifecycle,
} from "$tests/mocks/sns-projects.mock";
import { SnsSwapLifecycle } from "@dfinity/sns";
import { render } from "@testing-library/svelte";

jest.mock("$lib/services/sns.services", () => {
  return {
    loadSnsSwapStateStore: jest.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("ProjectCardSwapInfo", () => {
  const now = Date.now();
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it("should render deadline", () => {
    const { getByText } = render(ProjectCardSwapInfo, {
      props: {
        project: mockSnsFullProject,
      },
    });

    const durationTillDeadline =
      mockSnsFullProject.summary.swap.params.swap_due_timestamp_seconds -
      BigInt(Math.round(now / 1000));

    expect(
      getByText(secondsToDuration(durationTillDeadline))
    ).toBeInTheDocument();
  });

  it("should render starting time", () => {
    const project: SnsFullProject = {
      ...mockSnsFullProject,
      summary: {
        ...mockSnsFullProject.summary,
        swap: {
          ...mockSnsFullProject.summary.swap,
          decentralization_sale_open_timestamp_seconds: BigInt(
            now + SECONDS_IN_DAY
          ),
          lifecycle: SnsSwapLifecycle.Adopted,
        },
      },
    };
    const { getByText } = render(ProjectCardSwapInfo, {
      props: {
        project,
      },
    });

    const durationTillStart =
      project.summary.swap.decentralization_sale_open_timestamp_seconds -
      BigInt(Math.round(now / 1000));

    expect(getByText(secondsToDuration(durationTillStart))).toBeInTheDocument();
  });

  it("should render my commitment", () => {
    const { getByText } = render(ProjectCardSwapInfo, {
      props: {
        project: mockSnsFullProject,
      },
    });

    const icpValue = formatToken({
      value:
        getCommitmentE8s(
          mockSnsFullProject.swapCommitment as SnsSwapCommitment
        ) ?? BigInt(0),
    });

    expect(getByText(icpValue, { exact: false })).toBeInTheDocument();
  });

  it("should not render my commitment if `undefined`", () => {
    const { queryByTestId } = render(ProjectCardSwapInfo, {
      props: {
        project: {
          ...mockSnsFullProject,
          swapCommitment: {
            rootCanisterId: mockSnsFullProject.rootCanisterId,
            myCommitment: undefined,
          },
        },
      },
    });

    expect(
      queryByTestId("project-card-swap-info-component")
    ).toBeInTheDocument();
    expect(queryByTestId("commitment-token-value")).not.toBeInTheDocument();
  });

  it("should render completed", () => {
    const { getByText } = render(ProjectCardSwapInfo, {
      props: {
        project: {
          ...mockSnsFullProject,
          summary: summaryForLifecycle(SnsSwapLifecycle.Committed),
        },
      },
    });

    expect(getByText(en.sns_project_detail.completed)).toBeInTheDocument();
  });
});
