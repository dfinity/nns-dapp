import * as aggregatorApi from "$lib/api/sns-aggregator.api";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import { initAppPrivateData } from "$lib/services/app.services";
import { mockAccountDetails } from "$tests/mocks/icp-accounts.store.mock";
import { aggregatorSnsMock } from "$tests/mocks/sns-aggregator.mock";
import { toastsStore } from "@dfinity/gix-components";
import { LedgerCanister } from "@dfinity/nns";
import { get } from "svelte/store";
import { vi } from "vitest";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/api/sns-aggregator.api");

describe("app-services", () => {
  const mockLedgerCanister = mock<LedgerCanister>();
  const mockNNSDappCanister = mock<NNSDappCanister>();

  beforeEach(() => {
    toastsStore.reset();
    vi.clearAllMocks();
    vi.spyOn(LedgerCanister, "create").mockImplementation(
      (): LedgerCanister => mockLedgerCanister
    );

    vi.spyOn(NNSDappCanister, "create").mockImplementation(
      (): NNSDappCanister => mockNNSDappCanister
    );

    vi.spyOn(console, "error").mockImplementation(() => undefined);

    vi.spyOn(aggregatorApi, "querySnsProjects").mockResolvedValue([
      aggregatorSnsMock,
      aggregatorSnsMock,
    ]);
  });

  it("should init Nns", async () => {
    mockNNSDappCanister.getAccount.mockResolvedValue(mockAccountDetails);
    mockLedgerCanister.accountBalance.mockResolvedValue(BigInt(100_000_000));
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

  it("shuold init SNS", async () => {
    await initAppPrivateData();

    await expect(aggregatorApi.querySnsProjects).toHaveBeenCalledTimes(1);
  });

  it("should not show errors if loading accounts fails", async () => {
    mockNNSDappCanister.getAccount.mockRejectedValue(new Error("test"));
    mockLedgerCanister.accountBalance.mockResolvedValue(BigInt(100_000_000));
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
});
