/**
 * @jest-environment jsdom
 */

import ProjectCommitment from "$lib/components/project-detail/ProjectCommitment.svelte";
import * as summaryGetters from "$lib/getters/sns-summary";
import { snsSwapMetricsStore } from "$lib/stores/sns-swap-metrics.store";
import type { SnsSwapCommitment } from "$lib/types/sns";
import { formatToken } from "$lib/utils/token.utils";
import en from "$tests/mocks/i18n.mock";
import {
  createSummary,
  mockSnsFullProject,
  summaryForLifecycle,
} from "$tests/mocks/sns-projects.mock";
import { renderContextCmp } from "$tests/mocks/sns.mock";
import { SnsSwapLifecycle } from "@dfinity/sns";

// TODO: https://dfinity.atlassian.net/browse/GIX-1909 use nf participation field when present
jest.mock("$lib/getters/sns-summary.ts");

describe("ProjectCommitment", () => {
  const summary = summaryForLifecycle(SnsSwapLifecycle.Open);
  const saleBuyerCount = 1_000_000;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render min and max commitment", () => {
    const { queryByTestId } = renderContextCmp({
      summary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectCommitment,
    });
    expect(
      queryByTestId("commitment-max-indicator-value")?.textContent.trim()
    ).toEqual(`${formatToken({ value: summary.swap.params.max_icp_e8s })} ICP`);
    expect(
      queryByTestId("commitment-min-indicator-value")?.textContent.trim()
    ).toEqual(`${formatToken({ value: summary.swap.params.min_icp_e8s })} ICP`);
  });

  it("should render total participants from swap metrics", () => {
    snsSwapMetricsStore.setMetrics({
      rootCanisterId: mockSnsFullProject.swapCommitment.rootCanisterId,
      metrics: {
        saleBuyerCount,
      },
    });
    const summaryWithoutBuyers = createSummary({
      lifecycle: SnsSwapLifecycle.Open,
      buyersCount: null,
    });

    const { queryByTestId } = renderContextCmp({
      summary: summaryWithoutBuyers,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectCommitment,
    });

    const textContent: string =
      queryByTestId("sns-project-current-sale-buyer-count")?.textContent ?? "";

    expect(
      textContent.includes(en.sns_project_detail.current_sale_buyer_count)
    ).toBeTruthy();

    expect(textContent.includes(`${saleBuyerCount}`)).toBeTruthy();
  });

  it("should render total participants from derived state", () => {
    snsSwapMetricsStore.setMetrics({
      rootCanisterId: mockSnsFullProject.swapCommitment.rootCanisterId,
      metrics: {
        saleBuyerCount: 0,
      },
    });
    const summaryWithBuyersCount = createSummary({
      lifecycle: SnsSwapLifecycle.Open,
      buyersCount: BigInt(saleBuyerCount),
    });

    const { queryByTestId } = renderContextCmp({
      summary: summaryWithBuyersCount,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectCommitment,
    });

    const textContent: string =
      queryByTestId("sns-project-current-sale-buyer-count")?.textContent ?? "";

    expect(
      textContent.includes(en.sns_project_detail.current_sale_buyer_count)
    ).toBeTruthy();

    expect(textContent.includes(`${saleBuyerCount}`)).toBeTruthy();
  });

  it("should render overall current commitment", () => {
    const { queryByTestId } = renderContextCmp({
      summary,
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectCommitment,
    });

    const textContent: string =
      queryByTestId("sns-project-current-commitment")?.textContent ?? "";

    expect(
      textContent.includes(en.sns_project_detail.current_overall_commitment)
    ).toBeTruthy();

    expect(
      textContent.includes(
        `${formatToken({ value: summary.derived.buyer_total_icp_e8s })} ICP`
      )
    ).toBeTruthy();
  });

  it("should render a progress bar with total participation adding NF and direct commitments", () => {
    const directCommitment = 20000000000n;
    const nfCommitment = 10000000000n;
    // TODO: https://dfinity.atlassian.net/browse/GIX-1909 use nf participation field when present
    jest
      .spyOn(summaryGetters, "getNeuronsFundParticipation")
      .mockImplementation(() => nfCommitment);

    const { container } = renderContextCmp({
      summary: {
        ...summary,
        derived: {
          ...summary.derived,
          buyer_total_icp_e8s: directCommitment + nfCommitment,
        },
      },
      swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
      Component: ProjectCommitment,
    });

    expect(container.querySelector("progress").value).toBe(
      Number(directCommitment + nfCommitment)
    );
  });

  describe("when neurons fund participation is not available", () => {
    beforeEach(() => {
      // TODO: https://dfinity.atlassian.net/browse/GIX-1909 use nf participation field when present
      jest
        .spyOn(summaryGetters, "isNeuronsFundParticipationPresent")
        .mockImplementation(() => false);
    });

    it("should not render detailed participation if neurons fund participation is available", () => {
      const { queryByTestId } = renderContextCmp({
        summary,
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        Component: ProjectCommitment,
      });

      expect(
        queryByTestId("sns-project-current-nf-commitment")
      ).not.toBeInTheDocument();
      expect(
        queryByTestId("sns-project-current-direct-commitment")
      ).not.toBeInTheDocument();
    });
  });

  describe("when neurons fund participation is available", () => {
    const directCommitment = 20000000000n;
    beforeEach(() => {
      // TODO: https://dfinity.atlassian.net/browse/GIX-1909 use nf participation field when present
      jest
        .spyOn(summaryGetters, "isNeuronsFundParticipationPresent")
        .mockImplementation(() => true);
    });

    it("should render detailed participation if neurons fund participation is available", () => {
      const nfCommitment = 10000000000n;
      // TODO: https://dfinity.atlassian.net/browse/GIX-1909 use nf participation field when present
      jest
        .spyOn(summaryGetters, "getNeuronsFundParticipation")
        .mockImplementation(() => nfCommitment);

      const { queryByTestId } = renderContextCmp({
        summary: {
          ...summary,
          derived: {
            ...summary.derived,
            buyer_total_icp_e8s: directCommitment + nfCommitment,
          },
        },
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        Component: ProjectCommitment,
      });

      expect(
        queryByTestId("sns-project-current-nf-commitment").textContent.trim()
      ).toBe("Neurons' Fund Commitment 100.00 ICP");
      expect(
        queryByTestId(
          "sns-project-current-direct-commitment"
        ).textContent.trim()
      ).toBe("Direct Commitment 200.00 ICP");
    });

    it("should render detailed participation if neurons fund participation is available even with NF participation as 0", () => {
      const nfCommitment = 0n;
      // TODO: https://dfinity.atlassian.net/browse/GIX-1909 use nf participation field when present
      jest
        .spyOn(summaryGetters, "getNeuronsFundParticipation")
        .mockImplementation(() => nfCommitment);

      const { queryByTestId } = renderContextCmp({
        summary: {
          ...summary,
          derived: {
            ...summary.derived,
            buyer_total_icp_e8s: directCommitment + nfCommitment,
          },
        },
        swapCommitment: mockSnsFullProject.swapCommitment as SnsSwapCommitment,
        Component: ProjectCommitment,
      });

      expect(
        queryByTestId("sns-project-current-nf-commitment").textContent.trim()
      ).toBe("Neurons' Fund Commitment 0 ICP");
      expect(
        queryByTestId(
          "sns-project-current-direct-commitment"
        ).textContent.trim()
      ).toBe("Direct Commitment 200.00 ICP");
    });
  });
});
