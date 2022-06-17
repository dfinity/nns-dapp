/**
 * @jest-environment jsdom
 */

import { GovernanceCanister, ICP, LedgerCanister } from "@dfinity/nns";
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
import { mockNeuron } from "./mocks/neurons.mock";

jest.mock("../lib/services/worker.services", () => ({
  worker: {
    syncAuthIdle: jest.fn(() => Promise.resolve()),
  },
}));

describe("App", () => {
  const mockLedgerCanister = mock<LedgerCanister>();
  const mockNNSDappCanister = mock<NNSDappCanister>();
  const mockGovernanceCanister = mock<GovernanceCanister>();

  beforeAll(() => {
    jest
      .spyOn(authStore, "subscribe")
      .mockImplementation(mutableMockAuthStoreSubscribe);

    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation((): LedgerCanister => mockLedgerCanister);

    jest
      .spyOn(NNSDappCanister, "create")
      .mockImplementation((): NNSDappCanister => mockNNSDappCanister);

    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation((): GovernanceCanister => mockGovernanceCanister);

    mockCanisters();
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  const mockCanisters = () => {
    mockNNSDappCanister.getAccount.mockResolvedValue(mockAccountDetails);
    mockLedgerCanister.accountBalance.mockResolvedValue(
      ICP.fromString("1") as ICP
    );
    mockGovernanceCanister.listNeurons.mockResolvedValue([mockNeuron]);
  };

  it("should synchronize the accounts after sign in", async () => {
    render(App);

    authStoreMock.next({
      identity: mockIdentity,
    });

    // query + update calls
    const numberOfCalls = 2;

    const numberOfCheckNeuronsBalance = 1;

    await waitFor(() =>
      expect(mockNNSDappCanister.addAccount).toHaveBeenCalledTimes(
        numberOfCalls
      )
    );

    await waitFor(() =>
      expect(mockNNSDappCanister.getAccount).toHaveBeenCalledTimes(
        numberOfCalls
      )
    );

    await waitFor(() =>
      expect(mockLedgerCanister.accountBalance).toHaveBeenCalledTimes(
        numberOfCalls + numberOfCheckNeuronsBalance
      )
    );
  });

  it("should synchronize the neurons after sign in", async () => {
    render(App);

    authStoreMock.next({
      identity: mockIdentity,
    });

    // query + update calls
    const numberOfCalls = 2;

    await waitFor(() =>
      expect(mockGovernanceCanister.listNeurons).toHaveBeenCalledTimes(
        numberOfCalls
      )
    );
  });

  it("should register auth worker sync after sign in", async () => {
    render(App);

    authStoreMock.next({
      identity: mockIdentity,
    });

    expect(worker.syncAuthIdle).toHaveBeenCalled();
  });
});
