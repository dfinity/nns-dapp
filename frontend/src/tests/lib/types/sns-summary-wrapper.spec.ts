import type { SnsSummarySwap } from "$lib/types/sns";
import {
  mockDerived,
  mockInit,
  mockLifecycleResponse,
  mockMetadata,
  mockSnsParams,
  mockSummary,
  mockSwap,
  mockToken,
  principal,
} from "$tests/mocks/sns-projects.mock";
import type {
  SnsGetLifecycleResponse,
  SnsParams,
  SnsSwapDerivedState,
  SnsSwapInit,
} from "@dfinity/sns";
import { SnsSwapLifecycle } from "@dfinity/sns";

describe("SnsSummaryWrapper", () => {
  it("should return rootCanisterId", () => {
    const rootCanisterId = principal(323);
    const summary = mockSummary.override({ rootCanisterId });
    expect(summary.rootCanisterId.toText()).toBe(rootCanisterId.toText());
  });

  it("should return swapCanisterId", () => {
    const swapCanisterId = principal(324);
    const summary = mockSummary.override({ swapCanisterId });
    expect(summary.swapCanisterId.toText()).toBe(swapCanisterId.toText());
  });

  it("should return governanceCanisterId", () => {
    const governanceCanisterId = principal(325);
    const summary = mockSummary.override({ governanceCanisterId });
    expect(summary.governanceCanisterId.toText()).toBe(
      governanceCanisterId.toText()
    );
  });

  it("should return ledgerCanisterId", () => {
    const ledgerCanisterId = principal(326);
    const summary = mockSummary.override({ ledgerCanisterId });
    expect(summary.ledgerCanisterId.toText()).toBe(ledgerCanisterId.toText());
  });

  it("should return indexCanisterId", () => {
    const indexCanisterId = principal(327);
    const summary = mockSummary.override({ indexCanisterId });
    expect(summary.indexCanisterId.toText()).toBe(indexCanisterId.toText());
  });

  it("should return indexCanisterId", () => {
    const indexCanisterId = principal(328);
    const summary = mockSummary.override({ indexCanisterId });
    expect(summary.indexCanisterId.toText()).toBe(indexCanisterId.toText());
  });

  it("should return metadata", () => {
    const metadata = {
      ...mockMetadata,
      url: "https://example.com/wrapper-test",
    };
    const summary = mockSummary.override({ metadata });
    expect(summary.metadata).toBe(metadata);
  });

  it("should return token", () => {
    const token = {
      ...mockToken,
      name: "Wrapper token",
    };
    const summary = mockSummary.override({ token });
    expect(summary.token).toBe(token);
  });

  it("should return swap", () => {
    const swap: SnsSummarySwap = {
      ...mockSwap,
      next_ticket_id: [457831n],
    };
    const summary = mockSummary.override({ swap });
    expect(summary.swap).toBe(swap);
  });

  it("should return derived", () => {
    const derived: SnsSwapDerivedState = {
      ...mockDerived,
      direct_participant_count: [34294n],
    };
    const summary = mockSummary.overrideDerivedState(derived);
    expect(summary.derived).toBe(derived);
  });

  it("should return init", () => {
    const init: SnsSwapInit = {
      ...mockInit,
      nns_proposal_id: [91n],
    };
    const summary = mockSummary.override({ init });
    expect(summary.init).toBe(init);
  });

  it("should return swapParams", () => {
    const swapParams: SnsParams = {
      ...mockSnsParams,
      max_icp_e8s: 13_785_000_000n,
    };
    const summary = mockSummary.override({ swapParams });
    expect(summary.swapParams).toBe(swapParams);
  });

  it("should return lifecycle", () => {
    const lifecycle: SnsGetLifecycleResponse = {
      ...mockLifecycleResponse,
      lifecycle: [SnsSwapLifecycle.Aborted],
      decentralization_sale_open_timestamp_seconds: [168_100_000n],
    };
    const summary = mockSummary.overrideLifecycleResponse(lifecycle);
    expect(summary.lifecycle).toBe(lifecycle);
    expect(summary.getLifecycle()).toBe(SnsSwapLifecycle.Aborted);
  });
});
