/**
 * @jest-environment jsdom
 */

import type { HttpAgent } from "@dfinity/agent";
import {
  ICPToken,
  LedgerCanister,
  TokenAmount,
  type SnsWasmCanisterOptions,
} from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { SnsNeuronPermissionType } from "@dfinity/sns";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";
import mock from "jest-mock-extended/lib/Mock";
import { get } from "svelte/store";
import {
  addNeuronPermissions,
  participateInSnsSwap,
  queryAllSnsMetadata,
  querySnsMetadata,
  querySnsNeuron,
  querySnsNeurons,
  querySnsSwapCommitment,
  querySnsSwapState,
  querySnsSwapStates,
  removeNeuronPermissions,
} from "../../../lib/api/sns.api";
import { NNSDappCanister } from "../../../lib/canisters/nns-dapp/nns-dapp.canister";
import { NotAuthorizedError } from "../../../lib/canisters/nns-dapp/nns-dapp.errors";
import {
  importInitSnsWrapper,
  importSnsWasmCanister,
} from "../../../lib/proxy/api.import.proxy";
import { snsesCountStore } from "../../../lib/stores/sns.store";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockSnsNeuron } from "../../mocks/sns-neurons.mock";
import {
  createBuyersState,
  mockQueryMetadata,
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

jest.mock("../../../lib/proxy/api.import.proxy");
jest.mock("../../../lib/utils/agent.utils", () => {
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
  const queryNeuronSpy = jest.fn().mockResolvedValue(mockSnsNeuron);
  const addNeuronPermissionsSpy = jest.fn().mockResolvedValue(undefined);
  const removeNeuronPermissionsSpy = jest.fn().mockResolvedValue(undefined);

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
        getNeuron: queryNeuronSpy,
        addNeuronPermissions: addNeuronPermissionsSpy,
        removeNeuronPermissions: removeNeuronPermissionsSpy,
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it("should query sns metadata", async () => {
    const metadata = await querySnsMetadata({
      rootCanisterId: rootCanisterIdMock.toText(),
      identity: mockIdentity,
      certified: true,
    });

    expect(metadata).not.toBeNull();
    expect(metadata).toEqual(mockQueryMetadata);
  });

  it("should list all sns metadata", async () => {
    const metadata = await queryAllSnsMetadata({
      identity: mockIdentity,
      certified: true,
    });

    expect(metadata).not.toBeNull();
    expect(metadata.length).toEqual(1);
    expect(metadata).toEqual([mockQueryMetadata]);
  });

  it("should update snsesCountStore", async () => {
    await queryAllSnsMetadata({
      identity: mockIdentity,
      certified: true,
    });

    const $snsesCountStore = get(snsesCountStore);

    expect($snsesCountStore).toEqual(deployedSnsMock.length);
  });

  it("should query swap state", async () => {
    const state = await querySnsSwapState({
      rootCanisterId: rootCanisterIdMock.toText(),
      identity: mockIdentity,
      certified: true,
    });

    expect(state).not.toBeUndefined();
    expect(state?.swap).toEqual(mockQuerySwap.swap);
  });

  it("should list swap states", async () => {
    const states = await querySnsSwapStates({
      identity: mockIdentity,
      certified: true,
    });

    expect(states.length).toEqual(1);
    expect(states[0]?.swap).toEqual(mockQuerySwap.swap);
  });

  it("should return swap commitment", async () => {
    const commitment = await querySnsSwapCommitment({
      rootCanisterId: rootCanisterIdMock.toText(),
      identity: mockIdentity,
      certified: false,
    });
    expect(getUserCommitmentSpy).toBeCalled();
    expect(commitment).toEqual({
      rootCanisterId: rootCanisterIdMock,
      myCommitment: mockUserCommitment,
    });
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

  it("should query sns neurons", async () => {
    const neurons = await querySnsNeurons({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      certified: false,
    });

    expect(neurons).not.toBeNull();
    expect(neurons.length).toEqual(1);
    expect(queryNeuronsSpy).toBeCalled();
  });

  it("should query one sns neurons", async () => {
    const neuron = await querySnsNeuron({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      certified: false,
      neuronId: { id: arrayOfNumberToUint8Array([1, 2, 3]) },
    });

    expect(neuron).not.toBeNull();
    expect(queryNeuronSpy).toBeCalled();
  });

  it("should add neuron permissions", async () => {
    await addNeuronPermissions({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      principal: Principal.fromText("aaaaa-aa"),
      neuronId: { id: arrayOfNumberToUint8Array([1, 2, 3]) },
      permissions: [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE],
    });

    expect(addNeuronPermissionsSpy).toBeCalled();
  });

  it("should remove neuron permissions", async () => {
    await removeNeuronPermissions({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      principal: Principal.fromText("aaaaa-aa"),
      neuronId: { id: arrayOfNumberToUint8Array([1, 2, 3]) },
      permissions: [SnsNeuronPermissionType.NEURON_PERMISSION_TYPE_VOTE],
    });

    expect(removeNeuronPermissionsSpy).toBeCalled();
  });
});
