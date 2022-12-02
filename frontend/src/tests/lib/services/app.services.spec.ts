/**
 * @jest-environment jsdom
 */
import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import { initAppPrivate } from "$lib/services/app.services";
import { loadSnsSwapCommitments } from "$lib/services/sns.services";
import { GovernanceCanister, LedgerCanister } from "@dfinity/nns";
import { mock } from "jest-mock-extended";
import { mockAccountDetails } from "../../mocks/accounts.store.mock";
import { mockNeuron } from "../../mocks/neurons.mock";

jest.mock("$lib/services/sns.services", () => {
  return {
    loadSnsSwapCommitments: jest.fn().mockResolvedValue(Promise.resolve()),
  };
});

describe("app-services", () => {
  const mockLedgerCanister = mock<LedgerCanister>();
  const mockNNSDappCanister = mock<NNSDappCanister>();
  const mockGovernanceCanister = mock<GovernanceCanister>();

  beforeEach(() => {
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

  const mockCanisters = () => {
    mockNNSDappCanister.getAccount.mockResolvedValue(mockAccountDetails);
    mockLedgerCanister.accountBalance.mockResolvedValue(BigInt(100_000_000));
    mockGovernanceCanister.listNeurons.mockResolvedValue([mockNeuron]);
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should init Nns", async () => {
    await initAppPrivate();

    // query + update calls
    const numberOfCalls = 2;

    await expect(mockNNSDappCanister.addAccount).toHaveBeenCalledTimes(
      numberOfCalls
    );

    await expect(mockNNSDappCanister.getAccount).toHaveBeenCalledTimes(
      numberOfCalls
    );

    await expect(mockLedgerCanister.accountBalance).toHaveBeenCalledTimes(
      numberOfCalls
    );
  });

  it("should init Sns", async () => {
    await initAppPrivate();

    await expect(loadSnsSwapCommitments).toHaveBeenCalledTimes(1);
  });
});
