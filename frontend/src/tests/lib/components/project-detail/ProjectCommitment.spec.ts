/**
 * @jest-environment jsdom
 */

import ProjectCommitment from "$lib/components/project-detail/ProjectCommitment.svelte";
import * as summaryGetters from "$lib/getters/sns-summary";
import { snsSwapMetricsStore } from "$lib/stores/sns-swap-metrics.store";
import type { SnsSummary, SnsSwapCommitment } from "$lib/types/sns";
import {
  createSummary,
  mockSnsFullProject,
  summaryForLifecycle,
} from "$tests/mocks/sns-projects.mock";
import { renderContextCmp } from "$tests/mocks/sns.mock";
import { ProjectCommitmentPo } from "$tests/page-objects/ProjectCommitment.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { SnsSwapLifecycle } from "@dfinity/sns";

// TODO: https://dfinity.atlassian.net/browse/GIX-1909 use nf participation field when present
jest.mock("$lib/getters/sns-summary.ts");

describe("ProjectCommitment", () => {
  const summary = summaryForLifecycle(SnsSwapLifecycle.Open);
  const saleBuyerCount = 1_000_000;

  const renderComponent = (
    summary: SnsSummary,
    swapCommitment: SnsSwapCommitment = mockSnsFullProject.swapCommitment
  ) => {
    const { container } = renderContextCmp({
      summary,
      swapCommitment,
      Component: ProjectCommitment,
    });

    return ProjectCommitmentPo.under(new JestPageObjectElement(container));
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render min and max commitment", async () => {
    const summary = createSummary({
      maxTotalCommitment: 50000000000n,
      minTotalCommitment: 20000000000n,
    });
    const po = renderComponent(summary);
    expect(await po.getMaxCommitment()).toEqual("500.00 ICP");
    expect(await po.getMinCommitment()).toEqual("200.00 ICP");
  });

  it("should render total participants from swap metrics", async () => {
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

    const po = renderComponent(summaryWithoutBuyers);
    expect(await po.getParticipantsCount()).toEqual(saleBuyerCount);
  });

  it("should render total participants from derived state", async () => {
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

    const po = renderComponent(summaryWithBuyersCount);
    expect(await po.getParticipantsCount()).toEqual(saleBuyerCount);
  });

  it("should render overall current commitment", async () => {
    const summary = createSummary({
      currentTotalCommitment: 50000000000n,
    });
    const po = renderComponent(summary);

    expect(po.getCurrentTotalCommitment()).resolves.toEqual("500.00 ICP");
  });

  it("should render a progress bar with total participation adding NF and direct commitments", async () => {
    const directCommitment = 20000000000n;
    const nfCommitment = 10000000000n;
    // TODO: https://dfinity.atlassian.net/browse/GIX-1909 use nf participation field when present
    jest
      .spyOn(summaryGetters, "getNeuronsFundParticipation")
      .mockImplementation(() => nfCommitment);

    const summary = createSummary({
      currentTotalCommitment: directCommitment + nfCommitment,
    });
    const po = renderComponent(summary);
    const progressBarPo = po.getCommitmentProgressBarPo();
    expect(await progressBarPo.getTotalCommitmentE8s()).toBe(
      directCommitment + nfCommitment
    );
  });

  it("should render a progress bar with different participations", async () => {
    const directCommitment = 30000000000n;
    const nfCommitment = 10000000000n;
    // TODO: https://dfinity.atlassian.net/browse/GIX-1909 use nf participation field when present
    jest
      .spyOn(summaryGetters, "getNeuronsFundParticipation")
      .mockImplementation(() => nfCommitment);

    const summary = createSummary({
      currentTotalCommitment: directCommitment + nfCommitment,
    });
    const po = renderComponent(summary);
    const progressBarPo = po.getCommitmentProgressBarPo();
    expect(await progressBarPo.getNFCommitmentE8s()).toBe(nfCommitment);
    expect(await progressBarPo.getDirectCommitmentE8s()).toBe(directCommitment);
  });

  it("should not render detailed participation if neurons fund participation is not available", async () => {
    // TODO: https://dfinity.atlassian.net/browse/GIX-1909 use nf participation field when present
    jest
      .spyOn(summaryGetters, "getNeuronsFundParticipation")
      .mockImplementation(() => undefined);

    const po = renderComponent(summary);
    expect(await po.hasNeuronsFundParticipation()).toBe(false);
    expect(await po.hasDirectParticipation()).toBe(false);
  });

  it("should render detailed participation if neurons fund participation is available", async () => {
    const directCommitment = 20000000000n;
    const nfCommitment = 10000000000n;
    // TODO: https://dfinity.atlassian.net/browse/GIX-1909 use nf participation field when present
    jest
      .spyOn(summaryGetters, "getNeuronsFundParticipation")
      .mockImplementation(() => nfCommitment);

    const summary = createSummary({
      currentTotalCommitment: directCommitment + nfCommitment,
    });
    const po = renderComponent(summary);
    expect(await po.getNeuronsFundParticipation()).toEqual("100.00 ICP");
    expect(await po.getDirectParticipation()).toEqual("200.00 ICP");
  });

  it("should render detailed participation if neurons fund participation is available even with NF participation as 0", async () => {
    const directCommitment = 20000000000n;
    const nfCommitment = 0n;
    // TODO: https://dfinity.atlassian.net/browse/GIX-1909 use nf participation field when present
    jest
      .spyOn(summaryGetters, "getNeuronsFundParticipation")
      .mockImplementation(() => nfCommitment);

    const summary = createSummary({
      currentTotalCommitment: directCommitment + nfCommitment,
    });
    const po = renderComponent(summary);
    expect(await po.getNeuronsFundParticipation()).toEqual("0 ICP");
    expect(await po.getDirectParticipation()).toEqual("200.00 ICP");
  });
});
