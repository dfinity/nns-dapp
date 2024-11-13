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
  governanceCanisterIdMock,
  ledgerCanisterIdMock,
  rootCanisterIdMock,
  swapCanisterIdMock,
} from "$tests/mocks/sns.api.mock";
import { setSnsProjects } from "$tests/utils/sns.test-utils";
import type { Agent } from "@dfinity/agent";
import { LedgerCanister } from "@dfinity/ledger-icp";
import type { SnsWrapper } from "@dfinity/sns";
import * as dfinitySns from "@dfinity/sns";
import {
  SnsSwapLifecycle,
  type SnsGetLifecycleResponse,
  type SnsNeuronId,
} from "@dfinity/sns";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/proxy/api.import.proxy");
vi.mock("$lib/api/agent.api", () => {
  return {
    createAgent: () => Promise.resolve(mock<Agent>()),
  };
});

describe("sns-api", () => {
  const mockQuerySwap = {
    swap: [mockSwap],
    derived: [
      {
        sns_tokens_per_icp: 1,
        buyer_total_icp_e8s: 1_000_000_000n,
      },
    ],
  };

  const derivedState = {
    sns_tokens_per_icp: [1],
    buyer_total_icp_e8s: [1_000_000_000n],
  };
  const lifecycleResponse: SnsGetLifecycleResponse = {
    lifecycle: [SnsSwapLifecycle.Open],
    decentralization_sale_open_timestamp_seconds: [1n],
    decentralization_swap_termination_timestamp_seconds: [],
  };
  const notifyParticipationSpy = vi.fn().mockResolvedValue(undefined);
  const mockUserCommitment = createBuyersState(100_000_000n);
  const getUserCommitmentSpy = vi.fn().mockResolvedValue(mockUserCommitment);
  const getDerivedStateSpy = vi.fn().mockResolvedValue(derivedState);
  const getLifecycleSpy = vi.fn().mockResolvedValue(lifecycleResponse);
  const ledgerCanisterMock = mock<LedgerCanister>();
  const stakeNeuronSpy = vi.fn().mockResolvedValue(mockSnsNeuron.id);
  const increaseStakeNeuronSpy = vi.fn();

  beforeEach(() => {
    vi.spyOn(LedgerCanister, "create").mockImplementation(
      () => ledgerCanisterMock
    );

    const canisterIds = {
      rootCanisterId: rootCanisterIdMock,
      ledgerCanisterId: ledgerCanisterIdMock,
      governanceCanisterId: governanceCanisterIdMock,
      swapCanisterId: swapCanisterIdMock,
    };

    setSnsProjects([canisterIds]);

    vi.spyOn(dfinitySns, "SnsWrapper").mockReturnValue({
      canisterIds,
      metadata: () =>
        Promise.resolve([mockQueryMetadataResponse, mockQueryTokenResponse]),
      swapState: () => Promise.resolve(mockQuerySwap),
      notifyParticipation: notifyParticipationSpy,
      getUserCommitment: getUserCommitmentSpy,
      stakeNeuron: stakeNeuronSpy,
      increaseStakeNeuron: increaseStakeNeuronSpy,
      getDerivedState: getDerivedStateSpy,
      getLifecycle: getLifecycleSpy,
    } as unknown as SnsWrapper);
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
      stakeE8s: 200_000_000n,
      source: {
        owner: mockPrincipal,
      },
      controller: mockPrincipal,
      fee: 10_000n,
    });

    expect(neuronId).toEqual(mockSnsNeuron.id);
    expect(stakeNeuronSpy).toBeCalled();
  });

  it("should increase stake neuron", async () => {
    await increaseStakeNeuron({
      identity: mockIdentity,
      rootCanisterId: rootCanisterIdMock,
      stakeE8s: 200_000_000n,
      source: {
        owner: mockPrincipal,
      },
      neuronId: mockSnsNeuron.id[0] as SnsNeuronId,
    });

    expect(increaseStakeNeuronSpy).toBeCalled();
  });
});
