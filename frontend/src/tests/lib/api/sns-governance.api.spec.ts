/**
 * @jest-environment jsdom
 */

import {
  addNeuronPermissions,
  autoStakeMaturity,
  claimNeuron,
  disburse,
  getNervousSystemFunctions,
  getNeuronBalance,
  getSnsNeuron,
  increaseDissolveDelay,
  nervousSystemParameters,
  queryProposal,
  queryProposals,
  querySnsNeuron,
  querySnsNeurons,
  refreshNeuron,
  registerVote,
  removeNeuronPermissions,
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
import {
  mockSnsNeuron,
  snsNervousSystemParametersMock,
} from "$tests/mocks/sns-neurons.mock";
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
import type { HttpAgent } from "@dfinity/agent";
import { LedgerCanister, type SnsWasmCanisterOptions } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import {
  SnsNeuronPermissionType,
  SnsVote,
  type SnsListNervousSystemFunctionsResponse,
  type SnsNeuronId,
  type SnsProposalId,
} from "@dfinity/sns";
import { arrayOfNumberToUint8Array } from "@dfinity/utils";
import mock from "jest-mock-extended/lib/Mock";

jest.mock("$lib/proxy/api.import.proxy");
jest.mock("$lib/api/agent.api", () => {
  return {
    createAgent: () => Promise.resolve(mock<HttpAgent>()),
  };
});

describe("sns-api", () => {
  const ledgerCanisterMock = mock<LedgerCanister>();
  const proposals = [mockSnsProposal];
  const queryNeuronsSpy = jest.fn().mockResolvedValue([mockSnsNeuron]);
  const getNeuronSpy = jest.fn().mockResolvedValue(mockSnsNeuron);
  const queryNeuronSpy = jest.fn().mockResolvedValue(mockSnsNeuron);
  const addNeuronPermissionsSpy = jest.fn().mockResolvedValue(undefined);
  const removeNeuronPermissionsSpy = jest.fn().mockResolvedValue(undefined);
  const disburseSpy = jest.fn().mockResolvedValue(undefined);
  const splitNeuronSpy = jest.fn().mockResolvedValue(undefined);
  const startDissolvingSpy = jest.fn().mockResolvedValue(undefined);
  const stopDissolvingSpy = jest.fn().mockResolvedValue(undefined);
  const increaseDissolveDelaySpy = jest.fn().mockResolvedValue(undefined);
  const getNeuronBalanceSpy = jest.fn().mockResolvedValue(undefined);
  const refreshNeuronSpy = jest.fn().mockResolvedValue(undefined);
  const claimNeuronSpy = jest.fn().mockResolvedValue(undefined);
  const setTopicFolloweesSpy = jest.fn().mockResolvedValue(undefined);
  const stakeMaturitySpy = jest.fn().mockResolvedValue(undefined);
  const registerVoteSpy = jest.fn().mockResolvedValue(undefined);
  const autoStakeMaturitySpy = jest.fn().mockResolvedValue(undefined);
  const listProposalsSpy = jest.fn().mockResolvedValue(proposals);
  const getProposalSpy = jest.fn().mockResolvedValue(mockSnsProposal);
  const nervousSystemFunctionsMock: SnsListNervousSystemFunctionsResponse = {
    reserved_ids: new BigUint64Array(),
    functions: [nervousSystemFunctionMock],
  };
  const getFunctionsSpy = jest
    .fn()
    .mockResolvedValue(nervousSystemFunctionsMock);
  const nervousSystemParametersSpy = jest
    .fn()
    .mockResolvedValue(snsNervousSystemParametersMock);

  beforeAll(() => {
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
        listNeurons: queryNeuronsSpy,
        getNeuron: getNeuronSpy,
        queryNeuron: queryNeuronSpy,
        addNeuronPermissions: addNeuronPermissionsSpy,
        removeNeuronPermissions: removeNeuronPermissionsSpy,
        disburse: disburseSpy,
        splitNeuron: splitNeuronSpy,
        startDissolving: startDissolvingSpy,
        stopDissolving: stopDissolvingSpy,
        increaseDissolveDelay: increaseDissolveDelaySpy,
        getNeuronBalance: getNeuronBalanceSpy,
        refreshNeuron: refreshNeuronSpy,
        claimNeuron: claimNeuronSpy,
        listNervousSystemFunctions: getFunctionsSpy,
        nervousSystemParameters: nervousSystemParametersSpy,
        setTopicFollowees: setTopicFolloweesSpy,
        stakeMaturity: stakeMaturitySpy,
        registerVote: registerVoteSpy,
        autoStakeMaturity: autoStakeMaturitySpy,
        listProposals: listProposalsSpy,
        getProposal: getProposalSpy,
      })
    );
  });

  afterAll(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
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

  it("should increaseDissolveDelay", async () => {
    await increaseDissolveDelay({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      neuronId: { id: arrayOfNumberToUint8Array([1, 2, 3]) },
      additionalDissolveDelaySeconds: 123,
    });

    expect(increaseDissolveDelaySpy).toBeCalled();
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
      memo: BigInt(2),
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
      functionId: BigInt(3),
      followees: [followee1, followee2],
    });

    expect(setTopicFolloweesSpy).toBeCalled();
  });

  it("should get nervous system functions", async () => {
    const res = await getNervousSystemFunctions({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      certified: false,
    });

    expect(getFunctionsSpy).toBeCalled();
    expect(res).toEqual([nervousSystemFunctionMock]);
  });

  it("should get nervous system parameters", async () => {
    const res = await nervousSystemParameters({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      certified: false,
    });

    expect(nervousSystemParametersSpy).toBeCalled();
    expect(res).toEqual(snsNervousSystemParametersMock);
  });

  it("should get proposals", async () => {
    const res = await queryProposals({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      certified: false,
      params: {},
    });

    expect(listProposalsSpy).toBeCalled();
    expect(res).toEqual(proposals);
  });

  it("should get proposals", async () => {
    const proposalId: SnsProposalId = {
      id: BigInt(2),
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
});
