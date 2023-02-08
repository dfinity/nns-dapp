/**
 * @jest-environment jsdom
 */

import { NNSDappCanister } from "$lib/canisters/nns-dapp/nns-dapp.canister";
import { NotAuthorizedError } from "$lib/canisters/nns-dapp/nns-dapp.errors";
import {
  importInitSnsWrapper,
  importSnsWasmCanister,
} from "$lib/proxy/api.import.proxy";
import { participateInSnsSwap } from "$lib/services/sns-sale.services";
import type { HttpAgent } from "@dfinity/agent";
import {
  ICPToken,
  LedgerCanister,
  TokenAmount,
  type SnsWasmCanisterOptions,
} from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import mock from "jest-mock-extended/lib/Mock";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockSnsNeuron } from "../../mocks/sns-neurons.mock";
import {
  createBuyersState,
  mockQueryMetadataResponse,
  mockQueryTokenResponse,
  mockSwap,
} from "../../mocks/sns-projects.mock";
import {
  deployedSnsMock,
  governanceCanisterIdMock,
  ledgerCanisterIdMock,
  rootCanisterIdMock,
  swapCanisterIdMock,
} from "../../mocks/sns.api.mock";

jest.mock("$lib/proxy/api.import.proxy");
jest.mock("$lib/api/agent.api", () => {
  return {
    createAgent: () => Promise.resolve(mock<HttpAgent>()),
  };
});

describe("sns-api", () => {
  const mockQuerySwap = {
    swap: [mockSwap],
    derived: [
      {
        sns_tokens_per_icp: 1,
        buyer_total_icp_e8s: BigInt(1_000_000_000),
      },
    ],
  };

  const notifyParticipationSpy = jest.fn().mockResolvedValue(undefined);
  const mockUserCommitment = createBuyersState(BigInt(100_000_000));
  const getUserCommitmentSpy = jest.fn().mockResolvedValue(mockUserCommitment);
  const ledgerCanisterMock = mock<LedgerCanister>();
  const queryNeuronsSpy = jest.fn().mockResolvedValue([mockSnsNeuron]);
  const getNeuronSpy = jest.fn().mockResolvedValue(mockSnsNeuron);
  const queryNeuronSpy = jest.fn().mockResolvedValue(mockSnsNeuron);
  const stakeNeuronSpy = jest.fn().mockResolvedValue(mockSnsNeuron.id);
  const increaseStakeNeuronSpy = jest.fn();

  beforeEach(() => {
    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation(() => ledgerCanisterMock);

    (importSnsWasmCanister as jest.Mock).mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      create: (options: SnsWasmCanisterOptions) => ({
        listSnses: () => Promise.resolve(deployedSnsMock),
      }),
    });

    (importInitSnsWrapper as jest.Mock).mockResolvedValue(() =>
      Promise.resolve({
        canisterIds: {
          rootCanisterId: rootCanisterIdMock,
          ledgerCanisterId: ledgerCanisterIdMock,
          governanceCanisterId: governanceCanisterIdMock,
          swapCanisterId: swapCanisterIdMock,
        },
        metadata: () =>
          Promise.resolve([mockQueryMetadataResponse, mockQueryTokenResponse]),
        swapState: () => Promise.resolve(mockQuerySwap),
        notifyParticipation: notifyParticipationSpy,
        getUserCommitment: getUserCommitmentSpy,
        listNeurons: queryNeuronsSpy,
        getNeuron: getNeuronSpy,
        stakeNeuron: stakeNeuronSpy,
        queryNeuron: queryNeuronSpy,
        increaseStakeNeuron: increaseStakeNeuronSpy,
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should participate in a swap by notifying nnsdapp, transferring and notifying swap", async () => {
    const nnsDappMock = mock<NNSDappCanister>();
    nnsDappMock.addPendingNotifySwap.mockResolvedValue(undefined);
    jest.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

    await participateInSnsSwap({
      amount: TokenAmount.fromString({
        amount: "10",
        token: ICPToken,
      }) as TokenAmount,
      rootCanisterId: rootCanisterIdMock,
      identity: mockIdentity,
      controller: Principal.fromText("aaaaa-aa"),
    });

    expect(nnsDappMock.addPendingNotifySwap).toBeCalled();
    expect(ledgerCanisterMock.transfer).toBeCalled();
    expect(notifyParticipationSpy).toBeCalled();
  });

  it("should not participate in a swap if notifying nnsdapp fails", async () => {
    const nnsDappMock = mock<NNSDappCanister>();
    nnsDappMock.addPendingNotifySwap.mockRejectedValue(
      new NotAuthorizedError()
    );
    jest.spyOn(NNSDappCanister, "create").mockImplementation(() => nnsDappMock);

    const call = () =>
      participateInSnsSwap({
        amount: TokenAmount.fromString({
          amount: "10",
          token: ICPToken,
        }) as TokenAmount,
        rootCanisterId: rootCanisterIdMock,
        identity: mockIdentity,
        controller: Principal.fromText("aaaaa-aa"),
      });

    // We need to wait until the call has finished to check the call to nnsDappMock
    await expect(call).rejects.toThrow();
    expect(nnsDappMock.addPendingNotifySwap).toBeCalled();
    expect(ledgerCanisterMock.transfer).not.toBeCalled();
    expect(notifyParticipationSpy).not.toBeCalled();
  });
});
