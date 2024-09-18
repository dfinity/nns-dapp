import {
  addNeuronPermissions,
  autoStakeMaturity,
  claimNeuron,
  disburse,
  disburseMaturity,
  getNeuronBalance,
  getSnsNeuron,
  queryProposal,
  queryProposals,
  querySnsNeuron,
  querySnsNeurons,
  refreshNeuron,
  registerVote,
  removeNeuronPermissions,
  setDissolveDelay,
  setFollowees,
  splitNeuron,
  stakeMaturity,
  startDissolving,
  stopDissolving,
} from "$lib/api/sns-governance.api";
import {
  importInitSnsWrapper,
  importSnsWasmCanister,
} from "$lib/proxy/api.import.proxy";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { nervousSystemFunctionMock } from "$tests/mocks/sns-functions.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import {
  mockQueryMetadataResponse,
  mockQueryTokenResponse,
} from "$tests/mocks/sns-projects.mock";
import { mockSnsProposal } from "$tests/mocks/sns-proposals.mock";
import {
  deployedSnsMock,
  governanceCanisterIdMock,
  ledgerCanisterIdMock,
  rootCanisterIdMock,
  swapCanisterIdMock,
} from "$tests/mocks/sns.api.mock";
import type { Agent } from "@dfinity/agent";
import { LedgerCanister } from "@dfinity/ledger-icp";
import type { SnsWasmCanisterOptions } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import {
  SnsNeuronPermissionType,
  SnsVote,
  type SnsListNervousSystemFunctionsResponse,
  type SnsNeuronId,
  type SnsProposalId,
} from "@dfinity/sns";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";
import type { Mock } from "vitest";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/proxy/api.import.proxy");
vi.mock("$lib/api/agent.api", () => {
  return {
    createAgent: () => Promise.resolve(mock<Agent>()),
  };
});

describe("sns-api", () => {
  const ledgerCanisterMock = mock<LedgerCanister>();
  const proposals = [mockSnsProposal];
  const queryNeuronsSpy = vi.fn().mockResolvedValue([mockSnsNeuron]);
  const getNeuronSpy = vi.fn().mockResolvedValue(mockSnsNeuron);
  const queryNeuronSpy = vi.fn().mockResolvedValue(mockSnsNeuron);
  const addNeuronPermissionsSpy = vi.fn().mockResolvedValue(undefined);
  const removeNeuronPermissionsSpy = vi.fn().mockResolvedValue(undefined);
  const disburseSpy = vi.fn().mockResolvedValue(undefined);
  const splitNeuronSpy = vi.fn().mockResolvedValue(undefined);
  const startDissolvingSpy = vi.fn().mockResolvedValue(undefined);
  const stopDissolvingSpy = vi.fn().mockResolvedValue(undefined);
  const setDissolveDelaySpy = vi.fn().mockResolvedValue(undefined);
  const getNeuronBalanceSpy = vi.fn().mockResolvedValue(undefined);
  const refreshNeuronSpy = vi.fn().mockResolvedValue(undefined);
  const claimNeuronSpy = vi.fn().mockResolvedValue(undefined);
  const setTopicFolloweesSpy = vi.fn().mockResolvedValue(undefined);
  const stakeMaturitySpy = vi.fn().mockResolvedValue(undefined);
  const registerVoteSpy = vi.fn().mockResolvedValue(undefined);
  const autoStakeMaturitySpy = vi.fn().mockResolvedValue(undefined);
  const listProposalsSpy = vi.fn().mockResolvedValue({ proposals });
  const getProposalSpy = vi.fn().mockResolvedValue(mockSnsProposal);
  const disburseMaturitySpy = vi.fn().mockResolvedValue(undefined);
  const nervousSystemFunctionsMock: SnsListNervousSystemFunctionsResponse = {
    reserved_ids: new BigUint64Array(),
    functions: [nervousSystemFunctionMock],
  };
  const getFunctionsSpy = vi.fn().mockResolvedValue(nervousSystemFunctionsMock);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  beforeAll(() => {
    vi.spyOn(LedgerCanister, "create").mockImplementation(
      () => ledgerCanisterMock
    );

    (importSnsWasmCanister as Mock).mockResolvedValue({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      create: (options: SnsWasmCanisterOptions) => ({
        listSnses: () => Promise.resolve(deployedSnsMock),
      }),
    });

    (importInitSnsWrapper as Mock).mockResolvedValue(() =>
      Promise.resolve({
        canisterIds: {
          rootCanisterId: rootCanisterIdMock,
          ledgerCanisterId: ledgerCanisterIdMock,
          governanceCanisterId: governanceCanisterIdMock,
          swapCanisterId: swapCanisterIdMock,
        },
        metadata: () =>
          Promise.resolve([mockQueryMetadataResponse, mockQueryTokenResponse]),
        listNeurons: queryNeuronsSpy,
        getNeuron: getNeuronSpy,
        queryNeuron: queryNeuronSpy,
        addNeuronPermissions: addNeuronPermissionsSpy,
        removeNeuronPermissions: removeNeuronPermissionsSpy,
        disburse: disburseSpy,
        splitNeuron: splitNeuronSpy,
        startDissolving: startDissolvingSpy,
        stopDissolving: stopDissolvingSpy,
        setDissolveTimestamp: setDissolveDelaySpy,
        getNeuronBalance: getNeuronBalanceSpy,
        refreshNeuron: refreshNeuronSpy,
        claimNeuron: claimNeuronSpy,
        listNervousSystemFunctions: getFunctionsSpy,
        setTopicFollowees: setTopicFolloweesSpy,
        stakeMaturity: stakeMaturitySpy,
        registerVote: registerVoteSpy,
        autoStakeMaturity: autoStakeMaturitySpy,
        listProposals: listProposalsSpy,
        getProposal: getProposalSpy,
        disburseMaturity: disburseMaturitySpy,
      })
    );
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

  it("should get one sns neuron", async () => {
    const neuron = await getSnsNeuron({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      certified: false,
      neuronId: { id: arrayOfNumberToUint8Array([1, 2, 3]) },
    });

    expect(neuron).not.toBeNull();
    expect(getNeuronSpy).toBeCalled();
  });

  it("should query one sns neuron", async () => {
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

  it("should disburse", async () => {
    await disburse({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      neuronId: { id: arrayOfNumberToUint8Array([1, 2, 3]) },
    });

    expect(disburseSpy).toBeCalled();
  });

  it("should splitNeuron", async () => {
    await splitNeuron({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      neuronId: { id: arrayOfNumberToUint8Array([1, 2, 3]) },
      amount: 0n,
      memo: 0n,
    });

    expect(splitNeuronSpy).toBeCalled();
  });

  it("should startDissolving", async () => {
    await startDissolving({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      neuronId: { id: arrayOfNumberToUint8Array([1, 2, 3]) },
    });

    expect(startDissolvingSpy).toBeCalled();
  });

  it("should stopDissolving", async () => {
    await stopDissolving({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      neuronId: { id: arrayOfNumberToUint8Array([1, 2, 3]) },
    });

    expect(stopDissolvingSpy).toBeCalled();
  });

  it("should setDissolveDelay", async () => {
    const dissolveTimestampSeconds = 123;
    const neuronId = { id: arrayOfNumberToUint8Array([1, 2, 3]) };
    await setDissolveDelay({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      neuronId,
      dissolveTimestampSeconds,
    });

    expect(setDissolveDelaySpy).toBeCalledWith({
      dissolveTimestampSeconds: BigInt(dissolveTimestampSeconds),
      neuronId,
    });
  });

  it("should stakeMaturity", async () => {
    await stakeMaturity({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      neuronId: { id: arrayOfNumberToUint8Array([1, 2, 3]) },
      percentageToStake: 60,
    });

    expect(stakeMaturitySpy).toBeCalled();
  });

  it("should registerVote", async () => {
    await registerVote({
      neuronId: { id: arrayOfNumberToUint8Array([1, 2, 3]) },
      rootCanisterId: rootCanisterIdMock,
      identity: mockIdentity,
      proposalId: mockSnsProposal.id[0],
      vote: SnsVote.Yes,
    });

    expect(registerVoteSpy).toBeCalled();
  });

  it("should autoStakeMaturity", async () => {
    await autoStakeMaturity({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      neuronId: { id: arrayOfNumberToUint8Array([1, 2, 3]) },
      autoStake: true,
    });

    expect(autoStakeMaturitySpy).toBeCalled();
  });

  it("should getNeuronBalance", async () => {
    await getNeuronBalance({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      neuronId: { id: arrayOfNumberToUint8Array([1, 2, 3]) },
      certified: true,
    });

    expect(getNeuronBalanceSpy).toBeCalled();
  });

  it("should refreshNeuron", async () => {
    await refreshNeuron({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      neuronId: { id: arrayOfNumberToUint8Array([1, 2, 3]) },
    });

    expect(refreshNeuronSpy).toBeCalled();
  });

  it("should claimNeuron", async () => {
    await claimNeuron({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      memo: 2n,
      controller: Principal.fromText("aaaaa-aa"),
      subaccount: arrayOfNumberToUint8Array([1, 2, 3]),
    });

    expect(claimNeuronSpy).toBeCalled();
  });

  it("should setFollowees for a topic", async () => {
    const followee1: SnsNeuronId = { id: arrayOfNumberToUint8Array([1, 2, 3]) };
    const followee2: SnsNeuronId = { id: arrayOfNumberToUint8Array([1, 2, 4]) };
    await setFollowees({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      neuronId: mockSnsNeuron.id[0],
      functionId: 3n,
      followees: [followee1, followee2],
    });

    expect(setTopicFolloweesSpy).toBeCalled();
  });

  it("should get proposals", async () => {
    const res = await queryProposals({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      certified: false,
      params: {},
    });

    expect(listProposalsSpy).toBeCalled();
    expect(res).toEqual(expect.objectContaining({ proposals }));
  });

  it("should get a proposal", async () => {
    const proposalId: SnsProposalId = {
      id: 2n,
    };
    const res = await queryProposal({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      certified: false,
      proposalId,
    });

    expect(getProposalSpy).toBeCalledWith({ proposalId });
    expect(getProposalSpy).toBeCalledTimes(1);
    expect(res).toEqual(mockSnsProposal);
  });

  describe("disburseMaturity", () => {
    it("should disburse maturity", async () => {
      expect(disburseMaturitySpy).not.toBeCalled();
      const res = await disburseMaturity({
        identity: mockIdentity,
        rootCanisterId: rootCanisterIdMock,
        neuronId: mockSnsNeuron.id[0],
        percentageToDisburse: 33,
      });

      expect(res).toBeUndefined();
      expect(disburseMaturitySpy).toBeCalledTimes(1);
      expect(disburseMaturitySpy).toBeCalledWith({
        neuronId: mockSnsNeuron.id[0],
        percentageToDisburse: 33,
      });
    });

    it("should disburse maturity with account", async () => {
      const ownerText =
        "k2t6j-2nvnp-4zjm3-25dtz-6xhaa-c7boj-5gayf-oj3xs-i43lp-teztq-6ae";
      const owner = Principal.fromText(ownerText);
      const toAccount = {
        owner,
        subaccount: undefined,
      };

      expect(disburseMaturitySpy).not.toBeCalled();
      await disburseMaturity({
        identity: mockIdentity,
        rootCanisterId: rootCanisterIdMock,
        neuronId: mockSnsNeuron.id[0],
        percentageToDisburse: 33,
        toAccount,
      });

      expect(disburseMaturitySpy).toBeCalledTimes(1);
      expect(disburseMaturitySpy).toBeCalledWith({
        neuronId: mockSnsNeuron.id[0],
        percentageToDisburse: 33,
        toAccount,
      });
    });
  });
});
