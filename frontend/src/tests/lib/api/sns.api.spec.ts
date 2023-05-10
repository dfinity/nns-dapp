import {
  increaseStakeNeuron,
  queryAllSnsMetadata,
  querySnsDerivedState,
  querySnsLifecycle,
  querySnsMetadata,
  querySnsSwapCommitment,
  querySnsSwapState,
  querySnsSwapStates,
  stakeNeuron,
} from "$lib/api/sns.api";
import {
  importInitSnsWrapper,
  importSnsWasmCanister,
} from "$lib/proxy/api.import.proxy";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockSnsNeuron } from "$tests/mocks/sns-neurons.mock";
import {
  createBuyersState,
  mockQueryMetadata,
  mockQueryMetadataResponse,
  mockQueryTokenResponse,
  mockSwap,
} from "$tests/mocks/sns-projects.mock";
import {
  deployedSnsMock,
  governanceCanisterIdMock,
  ledgerCanisterIdMock,
  rootCanisterIdMock,
  swapCanisterIdMock,
} from "$tests/mocks/sns.api.mock";
import type { HttpAgent } from "@dfinity/agent";
import { LedgerCanister, type SnsWasmCanisterOptions } from "@dfinity/nns";
import {
  SnsSwapLifecycle,
  type SnsGetLifecycleResponse,
  type SnsNeuronId,
} from "@dfinity/sns";
import { vi, type Mock } from "vitest";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/proxy/api.import.proxy");
vi.mock("$lib/api/agent.api", () => {
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

  const derivedState = {
    sns_tokens_per_icp: [1],
    buyer_total_icp_e8s: [BigInt(1_000_000_000)],
  };
  const lifecycleResponse: SnsGetLifecycleResponse = {
    lifecycle: [SnsSwapLifecycle.Open],
    decentralization_sale_open_timestamp_seconds: [BigInt(1)],
  };
  const notifyParticipationSpy = vi.fn().mockResolvedValue(undefined);
  const mockUserCommitment = createBuyersState(BigInt(100_000_000));
  const getUserCommitmentSpy = vi.fn().mockResolvedValue(mockUserCommitment);
  const getDerivedStateSpy = vi.fn().mockResolvedValue(derivedState);
  const getLifecycleSpy = vi.fn().mockResolvedValue(lifecycleResponse);
  const ledgerCanisterMock = mock<LedgerCanister>();
  const stakeNeuronSpy = vi.fn().mockResolvedValue(mockSnsNeuron.id);
  const increaseStakeNeuronSpy = vi.fn();

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
        swapState: () => Promise.resolve(mockQuerySwap),
        notifyParticipation: notifyParticipationSpy,
        getUserCommitment: getUserCommitmentSpy,
        stakeNeuron: stakeNeuronSpy,
        increaseStakeNeuron: increaseStakeNeuronSpy,
        getDerivedState: getDerivedStateSpy,
        getLifecycle: getLifecycleSpy,
      })
    );
  });

  afterAll(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
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

  it("should return derived state", async () => {
    const receivedData = await querySnsDerivedState({
      rootCanisterId: rootCanisterIdMock.toText(),
      identity: mockIdentity,
      certified: false,
    });
    expect(getDerivedStateSpy).toBeCalled();
    expect(receivedData).toEqual(derivedState);
  });

  it("should return lifecycle state", async () => {
    const receivedData = await querySnsLifecycle({
      rootCanisterId: rootCanisterIdMock.toText(),
      identity: mockIdentity,
      certified: false,
    });
    expect(getLifecycleSpy).toBeCalled();
    expect(receivedData).toEqual(lifecycleResponse);
  });

  it("should stake neuron", async () => {
    const neuronId = await stakeNeuron({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      stakeE8s: BigInt(200_000_000),
      source: {
        owner: mockPrincipal,
      },
      controller: mockPrincipal,
      fee: BigInt(10000),
    });

    expect(neuronId).toEqual(mockSnsNeuron.id);
    expect(stakeNeuronSpy).toBeCalled();
  });

  it("should increase stake neuron", async () => {
    await increaseStakeNeuron({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      stakeE8s: BigInt(200_000_000),
      source: {
        owner: mockPrincipal,
      },
      neuronId: mockSnsNeuron.id[0] as SnsNeuronId,
    });

    expect(increaseStakeNeuronSpy).toBeCalled();
  });
});
