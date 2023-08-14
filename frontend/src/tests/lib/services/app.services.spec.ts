/**
 * @jest-environment jsdom
 */
import * as aggregatorApi from "$lib/api/sns-aggregator.api";
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import { initAppPrivateData } from "$lib/services/app.services";
import { resetIdentity } from "$tests/mocks/auth.store.mock";
import { mockAccountDetails } from "$tests/mocks/icp-accounts.store.mock";
import { aggregatorSnsMockDto } from "$tests/mocks/sns-aggregator.mock";
import { toastsStore } from "@dfinity/gix-components";
import { LedgerCanister } from "@dfinity/nns";
import { mock } from "jest-mock-extended";
import { get } from "svelte/store";

jest.mock("$lib/api/sns-aggregator.api");

describe("app-services", () => {
  const mockLedgerCanister = mock<LedgerCanister>();
  const mockNNSDappCanister = mock<NNSDappCanister>();

  beforeEach(() => {
    resetIdentity();
    toastsStore.reset();
    jest.clearAllMocks();
    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation((): LedgerCanister => mockLedgerCanister);

    jest
      .spyOn(NNSDappCanister, "create")
      .mockImplementation((): NNSDappCanister => mockNNSDappCanister);

    jest.spyOn(console, "error").mockImplementation(() => undefined);

    jest
      .spyOn(aggregatorApi, "querySnsProjects")
      .mockResolvedValue([aggregatorSnsMockDto, aggregatorSnsMockDto]);

    mockNNSDappCanister.getAccount.mockResolvedValue(mockAccountDetails);
    mockLedgerCanister.accountBalance.mockResolvedValue(BigInt(100_000_000));
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
});
