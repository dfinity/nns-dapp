/**
 * @jest-environment jsdom
 */

import { ICP, LedgerCanister } from "@dfinity/nns";
import { render, waitFor } from "@testing-library/svelte";
import { mock } from "jest-mock-extended";
import App from "../App.svelte";
import { NNSDappCanister } from "../lib/canisters/nns-dapp/nns-dapp.canister";
import { worker } from "../lib/services/worker.services";
import { authStore } from "../lib/stores/auth.store";
import { mockAccountDetails } from "./mocks/accounts.store.mock";
import {
  authStoreMock,
  mockIdentity,
  mutableMockAuthStoreSubscribe,
} from "./mocks/auth.store.mock";

jest.mock("../lib/services/worker.services", () => ({
  worker: {
    syncAuthIdle: jest.fn(() => Promise.resolve()),
  },
}));

describe("App", () => {
  const mockLedgerCanister = mock<LedgerCanister>();
  const mockNNSDappCanister = mock<NNSDappCanister>();

  beforeEach(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mutableMockAuthStoreSubscribe);

    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation((): LedgerCanister => mockLedgerCanister);

    jest
      .spyOn(NNSDappCanister, "create")
      .mockImplementation((): NNSDappCanister => mockNNSDappCanister);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should synchronize the accounts after sign in", async () => {
    mockNNSDappCanister.getAccount.mockResolvedValue(mockAccountDetails);
    mockLedgerCanister.accountBalance.mockResolvedValue(
      ICP.fromString("1") as ICP
    );

    render(App);

    authStoreMock.next({
      identity: mockIdentity,
    });

    await waitFor(() =>
      expect(mockNNSDappCanister.addAccount).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockNNSDappCanister.getAccount).toHaveBeenCalledTimes(1)
    );

    await waitFor(() =>
      expect(mockLedgerCanister.accountBalance).toHaveBeenCalledTimes(1)
    );
  });

  it("should register auth worker sync after sign in", async () => {
    mockNNSDappCanister.getAccount.mockResolvedValue(mockAccountDetails);
    mockLedgerCanister.accountBalance.mockResolvedValue(
      ICP.fromString("1") as ICP
    );

    render(App);

    authStoreMock.next({
      identity: mockIdentity,
    });

    expect(worker.syncAuthIdle).toHaveBeenCalled();
  });
});
