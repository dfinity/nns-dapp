import { clearSnsAggregatorCache } from "$lib/api-services/sns-aggregator.api-service";
import * as agent from "$lib/api/agent.api";
import * as aggregatorApi from "$lib/api/sns-aggregator.api";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import * as actionableProposalsServices from "$lib/services/actionable-proposals.services";
import * as actionableSnsProposalsServices from "$lib/services/actionable-sns-proposals.services";
import { initAppPrivateData } from "$lib/services/app.services";
import * as importedTokensServices from "$lib/services/imported-tokens.services";
import { overrideFeatureFlagsStore } from "$lib/stores/feature-flags.store";
import type { CachedSnsDto } from "$lib/types/sns-aggregator";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockAccountDetails } from "$tests/mocks/icp-accounts.store.mock";
import { aggregatorSnsMockDto } from "$tests/mocks/sns-aggregator.mock";
import { runResolvedPromises } from "$tests/utils/timers.test-utils";
import type { HttpAgent } from "@dfinity/agent";
import { toastsStore } from "@dfinity/gix-components";
import { LedgerCanister } from "@dfinity/ledger-icp";
import { get } from "svelte/store";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/api/sns-aggregator.api");

describe("app-services", () => {
  const mockLedgerCanister = mock<LedgerCanister>();
  const mockNNSDappCanister = mock<NNSDappCanister>();

  beforeEach(() => {
    resetIdentity();
    toastsStore.reset();
    vi.clearAllMocks();
    clearSnsAggregatorCache();
    overrideFeatureFlagsStore.reset();
    // resetSnsProjects();
    vi.spyOn(LedgerCanister, "create").mockImplementation(
      (): LedgerCanister => mockLedgerCanister
    );

    vi.spyOn(NNSDappCanister, "create").mockImplementation(
      (): NNSDappCanister => mockNNSDappCanister
    );

    vi.spyOn(console, "error").mockImplementation(() => undefined);

    vi.spyOn(aggregatorApi, "querySnsProjects").mockResolvedValue([
      aggregatorSnsMockDto,
      aggregatorSnsMockDto,
    ]);

    vi.spyOn(importedTokensServices, "loadImportedTokens").mockResolvedValue();

    mockNNSDappCanister.getAccount.mockResolvedValue(mockAccountDetails);
    mockLedgerCanister.accountBalance.mockResolvedValue(100_000_000n);
    vi.spyOn(agent, "createAgent").mockResolvedValue(mock<HttpAgent>());
  });

  it("should init Nns", async () => {
    await initAppPrivateData();

    // query + update calls
    const numberOfCalls = 2;

    await expect(mockNNSDappCanister.getAccount).toHaveBeenCalledTimes(
      numberOfCalls
    );

    await expect(mockLedgerCanister.accountBalance).toHaveBeenCalledTimes(
      numberOfCalls
    );
  });

  it("should init SNS", async () => {
    await initAppPrivateData();

    await expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(1);
  });

  it("should not show errors if loading accounts fails", async () => {
    mockNNSDappCanister.getAccount.mockRejectedValue(new Error("test"));
    await initAppPrivateData();

    // query + update calls
    const numberOfCalls = 2;

    await expect(mockNNSDappCanister.getAccount).toHaveBeenCalledTimes(
      numberOfCalls
    );

    await expect(mockLedgerCanister.accountBalance).not.toBeCalled();

    const toastData = get(toastsStore);
    expect(toastData).toHaveLength(0);
  });

  it("should call loadActionableProposals after Sns data is ready", async () => {
    const spyLoadActionableProposals = vi
      .spyOn(actionableProposalsServices, "loadActionableProposals")
      .mockResolvedValue();
    const spyLoadActionableSnsProposals = vi
      .spyOn(actionableSnsProposalsServices, "loadActionableSnsProposals")
      .mockResolvedValue();
    let querySnsProjectsResolver;
    vi.spyOn(aggregatorApi, "querySnsProjects").mockImplementation(
      (): Promise<CachedSnsDto[]> =>
        new Promise((resolve) => {
          querySnsProjectsResolver = () =>
            resolve([aggregatorSnsMockDto, aggregatorSnsMockDto]);
        })
    );

    initAppPrivateData();
    await runResolvedPromises();

    expect(spyLoadActionableProposals).toHaveBeenCalledTimes(0);
    expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(0);

    querySnsProjectsResolver();
    await runResolvedPromises();

    expect(spyLoadActionableProposals).toHaveBeenCalledTimes(1);
    expect(spyLoadActionableSnsProposals).toHaveBeenCalledTimes(1);
  });

  it("should call loadImportedTokens", async () => {
    const spyLoadImportedTokens = vi
      .spyOn(importedTokensServices, "loadImportedTokens")
      .mockResolvedValue();

    expect(mockNNSDappCanister.getAccount).toHaveBeenCalledTimes(0);
    expect(spyLoadImportedTokens).toHaveBeenCalledTimes(0);

    initAppPrivateData();
    await runResolvedPromises();

    expect(mockNNSDappCanister.getAccount).toHaveBeenCalledTimes(2);
    expect(spyLoadImportedTokens).toHaveBeenCalledTimes(1);
    expect(spyLoadImportedTokens).toHaveBeenCalledWith({
      ignoreAccountNotFoundError: true,
    });
  });

  it("should not loadImportedTokens when ENABLE_IMPORT_TOKEN is disabled", async () => {
    overrideFeatureFlagsStore.setFlag("ENABLE_IMPORT_TOKEN", false);
    const spyLoadImportedTokens = vi
      .spyOn(importedTokensServices, "loadImportedTokens")
      .mockResolvedValue();

    expect(mockNNSDappCanister.getAccount).toHaveBeenCalledTimes(0);
    expect(spyLoadImportedTokens).toHaveBeenCalledTimes(0);

    await initAppPrivateData();

    expect(mockNNSDappCanister.getAccount).toHaveBeenCalledTimes(2);
    expect(spyLoadImportedTokens).toHaveBeenCalledTimes(0);
  });
});
