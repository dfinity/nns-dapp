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
} from "$tests/mocks/sns-projects.mock";
import { renderContextCmp } from "$tests/mocks/sns.mock";
import { ProjectCommitmentPo } from "$tests/page-objects/ProjectCommitment.page-object";
import { JestPageObjectElement } from "$tests/page-objects/jest.page-object";
import { SnsSwapLifecycle } from "@dfinity/sns";

// TODO: https://dfinity.atlassian.net/browse/GIX-1909 use nf participation field when present
jest.mock("$lib/getters/sns-summary.ts");

describe("ProjectCommitment", () => {
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

  describe("when Neurons' Fund enhancements fields are available", () => {
    const nfCommitment = 10000000000n;
    const directCommitment = 30000000000n;
    const summary = createSummary({
      currentTotalCommitment: directCommitment + nfCommitment,
    });

    beforeEach(() => {
      jest
        .spyOn(summaryGetters, "getNeuronsFundParticipation")
        .mockImplementation(() => nfCommitment);
      // TODO: https://dfinity.atlassian.net/browse/GIX-1936 use min direct field when present
      jest
        .spyOn(summaryGetters, "getMinDirectParticipation")
        .mockImplementation(() => 10000000000n);
      // TODO: https://dfinity.atlassian.net/browse/GIX-1936 use min direct field when present
      jest
        .spyOn(summaryGetters, "getMaxDirectParticipation")
        .mockImplementation(() => 100000000000n);
    });

    it("should render a progress bar with direct participation", async () => {
      const po = renderComponent(summary);
      const progressBarPo = po.getCommitmentProgressBarPo();
      expect(await progressBarPo.getCommitmentE8s()).toBe(directCommitment);
    });

    it("should render detailed participation if neurons fund participation is available", async () => {
      const po = renderComponent(summary);
      expect(await po.getNeuronsFundParticipation()).toEqual("100.00 ICP");
      expect(await po.getDirectParticipation()).toEqual("300.00 ICP");
    });

    it("should render progress bar with primary color", async () => {
      const po = renderComponent(summary);
      const progressBarPo = po.getCommitmentProgressBarPo();
      expect(await progressBarPo.getColor()).toEqual("primary");
    });
  });

  describe("when Neurons' Fund enhancements fields are available and NF commitment is 0", () => {
    beforeEach(() => {
      jest
        .spyOn(summaryGetters, "getNeuronsFundParticipation")
        .mockImplementation(() => 0n);
      // TODO: https://dfinity.atlassian.net/browse/GIX-1936 use min direct field when present
      jest
        .spyOn(summaryGetters, "getMinDirectParticipation")
        .mockImplementation(() => 10000000000n);
      // TODO: https://dfinity.atlassian.net/browse/GIX-1936 use min direct field when present
      jest
        .spyOn(summaryGetters, "getMaxDirectParticipation")
        .mockImplementation(() => 100000000000n);
    });

    it("should render detailed participation if neurons fund participation is zero", async () => {
      const directCommitment = 20000000000n;
      const summary = createSummary({
        currentTotalCommitment: directCommitment,
      });
      const po = renderComponent(summary);
      expect(await po.getNeuronsFundParticipation()).toEqual("0 ICP");
      expect(await po.getDirectParticipation()).toEqual("200.00 ICP");
    });
  });

  describe("when Neurons' Fund enhancements fields are not available", () => {
    const overallCommitment = 30000000000n;
    const summary = createSummary({
      currentTotalCommitment: overallCommitment,
    });

    beforeEach(() => {
      jest
        .spyOn(summaryGetters, "getNeuronsFundParticipation")
        .mockImplementation(() => undefined);
      // TODO: https://dfinity.atlassian.net/browse/GIX-1936 use min direct field when present
      jest
        .spyOn(summaryGetters, "getMinDirectParticipation")
        .mockImplementation(() => undefined);
      // TODO: https://dfinity.atlassian.net/browse/GIX-1936 use min direct field when present
      jest
        .spyOn(summaryGetters, "getMaxDirectParticipation")
        .mockImplementation(() => undefined);
    });

    it("should render a progress bar with overall participation", async () => {
      const po = renderComponent(summary);
      const progressBarPo = po.getCommitmentProgressBarPo();
      expect(await progressBarPo.getCommitmentE8s()).toBe(overallCommitment);
    });

    it("should not render detailed participation", async () => {
      const po = renderComponent(summary);
      expect(await po.hasNeuronsFundParticipation()).toBe(false);
      expect(await po.hasDirectParticipation()).toBe(false);
    });

    it("should render progress bar with warning color", async () => {
      const po = renderComponent(summary);
      const progressBarPo = po.getCommitmentProgressBarPo();
      expect(await progressBarPo.getColor()).toEqual("warning");
    });
  });
});
