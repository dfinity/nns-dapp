import {
  addHotkey,
  autoStakeMaturity,
  disburse,
  increaseDissolveDelay,
  joinCommunityFund,
  leaveCommunityFund,
  mergeMaturity,
  mergeNeurons,
  queryKnownNeurons,
  queryLastestRewardEvent,
  queryNeuron,
  queryNeurons,
  registerVote,
  removeHotkey,
  setFollowees,
  simulateMergeNeurons,
  spawnNeuron,
  splitNeuron,
  stakeMaturity,
  stakeNeuron,
  stakeNeuronIcrc1,
  startDissolving,
  stopDissolving,
} from "$lib/api/governance.api";
import { mockIdentity } from "$tests/mocks/auth.store.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import type { Agent } from "@dfinity/agent";
import { GovernanceCanister, LedgerCanister, Topic, Vote } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { mock } from "jest-mock-extended";

jest.mock("$lib/api/agent.api", () => {
  return {
    createAgent: () => Promise.resolve(mock<Agent>()),
  };
});

describe("neurons-api", () => {
  const mockGovernanceCanister = mock<GovernanceCanister>();
  beforeEach(() => {
    jest.resetAllMocks();

    mockGovernanceCanister.listNeurons.mockImplementation(
      jest.fn().mockResolvedValue([])
    );
    mockGovernanceCanister.listKnownNeurons.mockImplementation(
      jest.fn().mockResolvedValue([])
    );
    mockGovernanceCanister.stakeNeuron.mockImplementation(jest.fn());
    mockGovernanceCanister.getNeuron.mockImplementation(
      jest.fn().mockResolvedValue(mockNeuron)
    );
    mockGovernanceCanister.registerVote.mockResolvedValue(undefined);
    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation(() => mockGovernanceCanister);
  });

  it("stakeNeuron creates a new neuron", async () => {
    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation(() => mock<LedgerCanister>());

    expect(mockGovernanceCanister.stakeNeuron).not.toBeCalled();

    const stake = BigInt(20_000_000);
    const controller = mockIdentity.getPrincipal();
    const fromSubAccount = [2, 3, 4];

    await stakeNeuron({
      stake,
      controller,
      ledgerCanisterIdentity: mockIdentity,
      identity: mockIdentity,
      fromSubAccount,
    });

    expect(mockGovernanceCanister.stakeNeuron).toBeCalledTimes(1);
    expect(mockGovernanceCanister.stakeNeuron).toBeCalledWith(
      expect.objectContaining({
        stake,
        principal: controller,
        fromSubAccount,
      })
    );
  });

  it("stakeNeuronIcrc1 creates a new neuron", async () => {
    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation(() => mock<LedgerCanister>());

    expect(mockGovernanceCanister.stakeNeuronIcrc1).not.toBeCalled();

    const stake = BigInt(20_000_000);
    const controller = mockIdentity.getPrincipal();
    const fromSubAccount = new Uint8Array([5, 6, 7]);

    await stakeNeuronIcrc1({
      stake,
      controller,
      ledgerCanisterIdentity: mockIdentity,
      identity: mockIdentity,
      fromSubAccount,
    });

    expect(mockGovernanceCanister.stakeNeuronIcrc1).toBeCalledTimes(1);
    expect(mockGovernanceCanister.stakeNeuronIcrc1).toBeCalledWith(
      expect.objectContaining({
        stake,
        principal: controller,
        fromSubAccount,
      })
    );

    expect(mockGovernanceCanister.stakeNeuron).not.toBeCalled();
  });

  it("queryNeurons fetches neurons", async () => {
    expect(mockGovernanceCanister.listNeurons).not.toBeCalled();

    await queryNeurons({ identity: mockIdentity, certified: false });

    expect(mockGovernanceCanister.listNeurons).toBeCalled();
  });

  it("queryKnownNeurons fetches known neurons", async () => {
    expect(mockGovernanceCanister.listKnownNeurons).not.toBeCalled();

    await queryKnownNeurons({ identity: mockIdentity, certified: false });

    expect(mockGovernanceCanister.listKnownNeurons).toBeCalled();
  });

  it("get neuron returns expected neuron", async () => {
    expect(mockGovernanceCanister.getNeuron).not.toBeCalled();

    const neuron = await queryNeuron({
      neuronId: mockNeuron.neuronId,
      identity: mockIdentity,
      certified: true,
    });

    expect(mockGovernanceCanister.getNeuron).toBeCalled();
    expect(neuron).not.toBeUndefined();
    expect(neuron?.neuronId).toEqual(mockNeuron.neuronId);
  });

  describe("increaseDissolveDelay", () => {
    it("updates neuron", async () => {
      mockGovernanceCanister.increaseDissolveDelay.mockImplementation(
        jest.fn().mockResolvedValue(undefined)
      );

      await increaseDissolveDelay({
        neuronId: BigInt(10),
        dissolveDelayInSeconds: 12000,
        identity: mockIdentity,
      });

      expect(mockGovernanceCanister.increaseDissolveDelay).toBeCalled();
    });

    it("throws error when updating neuron fails", async () => {
      const error = new Error();
      mockGovernanceCanister.increaseDissolveDelay.mockImplementation(
        jest.fn(() => {
          throw error;
        })
      );

      const call = () =>
        increaseDissolveDelay({
          neuronId: BigInt(10),
          dissolveDelayInSeconds: 12000,
          identity: mockIdentity,
        });

      await expect(call).rejects.toThrow(error);
    });
  });

  describe("setFollowees", () => {
    it("updates neuron successfully", async () => {
      mockGovernanceCanister.setFollowees.mockImplementation(
        jest.fn().mockResolvedValue(undefined)
      );

      await setFollowees({
        identity: mockIdentity,
        neuronId: BigInt(10),
        topic: Topic.ExchangeRate,
        followees: [BigInt(4), BigInt(7)],
      });

      expect(mockGovernanceCanister.setFollowees).toBeCalled();
    });

    it("throws error when setting followees fails", async () => {
      const error = new Error();
      mockGovernanceCanister.setFollowees.mockImplementation(
        jest.fn(() => {
          throw error;
        })
      );

      const call = () =>
        setFollowees({
          identity: mockIdentity,
          neuronId: BigInt(10),
          topic: Topic.ExchangeRate,
          followees: [BigInt(4), BigInt(7)],
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("joinCommunityFund", () => {
    it("updates neuron successfully", async () => {
      mockGovernanceCanister.joinCommunityFund.mockImplementation(
        jest.fn().mockResolvedValue(undefined)
      );

      await joinCommunityFund({
        identity: mockIdentity,
        neuronId: BigInt(10),
      });

      expect(mockGovernanceCanister.joinCommunityFund).toBeCalled();
    });

    it("throws error when joining community fund fails", async () => {
      const error = new Error();
      mockGovernanceCanister.joinCommunityFund.mockImplementation(
        jest.fn(() => {
          throw error;
        })
      );

      const call = () =>
        joinCommunityFund({
          identity: mockIdentity,
          neuronId: BigInt(10),
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("leaveCommunityFund", () => {
    it("updates neuron successfully", async () => {
      mockGovernanceCanister.leaveCommunityFund.mockImplementation(
        jest.fn().mockResolvedValue(undefined)
      );

      await leaveCommunityFund({
        identity: mockIdentity,
        neuronId: BigInt(10),
      });

      expect(mockGovernanceCanister.leaveCommunityFund).toBeCalled();
    });

    it("throws error when leaving community fund fails", async () => {
      const error = new Error();
      mockGovernanceCanister.leaveCommunityFund.mockImplementation(
        jest.fn(() => {
          throw error;
        })
      );

      const call = () =>
        leaveCommunityFund({
          identity: mockIdentity,
          neuronId: BigInt(10),
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("disburse", () => {
    it("disburses neuron successfully", async () => {
      mockGovernanceCanister.disburse.mockImplementation(
        jest.fn().mockResolvedValue(undefined)
      );

      await disburse({
        identity: mockIdentity,
        toAccountId: mockMainAccount.identifier,
        neuronId: BigInt(10),
      });

      expect(mockGovernanceCanister.disburse).toBeCalled();
    });

    it("throws error when disburse fails", async () => {
      const error = new Error();
      mockGovernanceCanister.disburse.mockImplementation(
        jest.fn(() => {
          throw error;
        })
      );

      const call = () =>
        disburse({
          identity: mockIdentity,
          toAccountId: mockMainAccount.identifier,
          neuronId: BigInt(10),
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("mergeMaturity", () => {
    it("merges a percentage of the maturity of a neuron successfully", async () => {
      mockGovernanceCanister.mergeMaturity.mockImplementation(
        jest.fn().mockResolvedValue(undefined)
      );

      await mergeMaturity({
        identity: mockIdentity,
        percentageToMerge: 50,
        neuronId: BigInt(10),
      });

      expect(mockGovernanceCanister.mergeMaturity).toBeCalled();
    });

    it("throws error when mergeMaturity fails", async () => {
      const error = new Error();
      mockGovernanceCanister.mergeMaturity.mockImplementation(
        jest.fn(() => {
          throw error;
        })
      );

      const call = () =>
        mergeMaturity({
          identity: mockIdentity,
          percentageToMerge: 50,
          neuronId: BigInt(10),
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("stakeMaturity", () => {
    it("stake the maturity of a neuron successfully", async () => {
      mockGovernanceCanister.stakeMaturity.mockImplementation(
        jest.fn().mockResolvedValue(undefined)
      );

      await stakeMaturity({
        identity: mockIdentity,
        percentageToStake: 50,
        neuronId: BigInt(10),
      });

      expect(mockGovernanceCanister.stakeMaturity).toBeCalled();
    });

    it("throws error when stakeMaturity fails", async () => {
      const error = new Error();
      mockGovernanceCanister.stakeMaturity.mockImplementation(
        jest.fn(() => {
          throw error;
        })
      );

      const call = () =>
        stakeMaturity({
          identity: mockIdentity,
          percentageToStake: 50,
          neuronId: BigInt(10),
        });

      await expect(call).rejects.toThrow(error);
    });
  });

  describe("autoStakeMaturity", () => {
    it("auto stake the maturity of a neuron successfully", async () => {
      mockGovernanceCanister.autoStakeMaturity.mockImplementation(
        jest.fn().mockResolvedValue(undefined)
      );

      await autoStakeMaturity({
        identity: mockIdentity,
        autoStake: true,
        neuronId: BigInt(10),
      });

      expect(mockGovernanceCanister.autoStakeMaturity).toBeCalled();
    });

    it("throws error when autoStakeMaturity fails", async () => {
      const error = new Error();
      mockGovernanceCanister.autoStakeMaturity.mockImplementation(
        jest.fn(() => {
          throw error;
        })
      );

      const call = () =>
        autoStakeMaturity({
          identity: mockIdentity,
          autoStake: true,
          neuronId: BigInt(10),
        });

      await expect(call).rejects.toThrow(error);
    });

    it("should enable auto stake the maturity of a neuron", async () => {
      mockGovernanceCanister.autoStakeMaturity.mockImplementation(
        jest.fn().mockResolvedValue(undefined)
      );

      const expected = {
        autoStake: true,
        neuronId: BigInt(10),
      };

      await autoStakeMaturity({
        identity: mockIdentity,
        ...expected,
      });

      expect(mockGovernanceCanister.autoStakeMaturity).toBeCalledWith(expected);
    });

    it("should disable auto stake the maturity of a neuron", async () => {
      mockGovernanceCanister.autoStakeMaturity.mockImplementation(
        jest.fn().mockResolvedValue(undefined)
      );

      const expected = {
        autoStake: false,
        neuronId: BigInt(10),
      };

      await autoStakeMaturity({
        identity: mockIdentity,
        ...expected,
      });

      expect(mockGovernanceCanister.autoStakeMaturity).toBeCalledWith(expected);
    });
  });

  describe("spawnNeuron", () => {
    it("spawn a neuron from a percentage of the maturity successfully", async () => {
      const newNeuronId = BigInt(12333);
      mockGovernanceCanister.spawnNeuron.mockImplementation(
        jest.fn().mockResolvedValue(newNeuronId)
      );

      const actualNeuronId = await spawnNeuron({
        identity: mockIdentity,
        percentageToSpawn: 50,
        neuronId: BigInt(10),
      });

      expect(mockGovernanceCanister.spawnNeuron).toBeCalled();
      expect(actualNeuronId).toEqual(newNeuronId);
    });

    it("throws error when spawnNeuron fails", async () => {
      const error = new Error();
      mockGovernanceCanister.spawnNeuron.mockImplementation(
        jest.fn(() => {
          throw error;
        })
      );

      const call = () =>
        spawnNeuron({
          identity: mockIdentity,
          percentageToSpawn: 50,
          neuronId: BigInt(10),
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("merge", () => {
    it("merges neurons successfully", async () => {
      mockGovernanceCanister.mergeNeurons.mockImplementation(
        jest.fn().mockResolvedValue(undefined)
      );

      await mergeNeurons({
        identity: mockIdentity,
        sourceNeuronId: BigInt(10),
        targetNeuronId: BigInt(11),
      });

      expect(mockGovernanceCanister.mergeNeurons).toBeCalled();
    });

    it("throws error when merging neurons fails", async () => {
      const error = new Error();
      mockGovernanceCanister.mergeNeurons.mockImplementation(
        jest.fn(() => {
          throw error;
        })
      );

      const call = () =>
        mergeNeurons({
          identity: mockIdentity,
          sourceNeuronId: BigInt(10),
          targetNeuronId: BigInt(11),
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("simulate merge neurons", () => {
    it("simulates merging neurons successfully", async () => {
      mockGovernanceCanister.simulateMergeNeurons.mockImplementation(
        jest.fn().mockResolvedValue(undefined)
      );

      await simulateMergeNeurons({
        identity: mockIdentity,
        sourceNeuronId: BigInt(10),
        targetNeuronId: BigInt(11),
      });

      expect(mockGovernanceCanister.simulateMergeNeurons).toBeCalled();
    });

    it("throws error when simulating merging fails", async () => {
      const error = new Error();
      mockGovernanceCanister.simulateMergeNeurons.mockImplementation(
        jest.fn(() => {
          throw error;
        })
      );

      const call = () =>
        simulateMergeNeurons({
          identity: mockIdentity,
          sourceNeuronId: BigInt(10),
          targetNeuronId: BigInt(11),
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("addHotkey", () => {
    it("updates neuron successfully", async () => {
      mockGovernanceCanister.addHotkey.mockImplementation(
        jest.fn().mockResolvedValue(undefined)
      );

      await addHotkey({
        identity: mockIdentity,
        neuronId: BigInt(10),
        principal: Principal.fromText("aaaaa-aa"),
      });

      expect(mockGovernanceCanister.addHotkey).toBeCalled();
    });

    it("throws error when adding hotkey fails", async () => {
      const error = new Error();
      mockGovernanceCanister.addHotkey.mockImplementation(
        jest.fn(() => {
          throw error;
        })
      );

      const call = () =>
        addHotkey({
          identity: mockIdentity,
          neuronId: BigInt(10),
          principal: Principal.fromText("aaaaa-aa"),
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("removeHotkey", () => {
    it("updates neuron successfully", async () => {
      mockGovernanceCanister.removeHotkey.mockImplementation(
        jest.fn().mockResolvedValue(undefined)
      );

      await removeHotkey({
        identity: mockIdentity,
        neuronId: BigInt(10),
        principal: Principal.fromText("aaaaa-aa"),
      });

      expect(mockGovernanceCanister.removeHotkey).toBeCalled();
    });

    it("throws error when removing hotkey fails", async () => {
      const error = new Error();
      mockGovernanceCanister.removeHotkey.mockImplementation(
        jest.fn(() => {
          throw error;
        })
      );

      const call = () =>
        removeHotkey({
          identity: mockIdentity,
          neuronId: BigInt(10),
          principal: Principal.fromText("aaaaa-aa"),
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("startDissolving", () => {
    it("updates neuron successfully", async () => {
      mockGovernanceCanister.startDissolving.mockImplementation(
        jest.fn().mockResolvedValue(undefined)
      );

      await startDissolving({
        identity: mockIdentity,
        neuronId: BigInt(10),
      });

      expect(mockGovernanceCanister.startDissolving).toBeCalled();
    });

    it("throws error when startDissolving fails", async () => {
      const error = new Error();
      mockGovernanceCanister.startDissolving.mockImplementation(
        jest.fn(() => {
          throw error;
        })
      );

      const call = () =>
        startDissolving({
          identity: mockIdentity,
          neuronId: BigInt(10),
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("stopDissolving", () => {
    it("updates neuron successfully", async () => {
      mockGovernanceCanister.stopDissolving.mockImplementation(
        jest.fn().mockResolvedValue(undefined)
      );

      await stopDissolving({
        identity: mockIdentity,
        neuronId: BigInt(10),
      });

      expect(mockGovernanceCanister.stopDissolving).toBeCalled();
    });

    it("throws error when stopDissolving fails", async () => {
      const error = new Error();
      mockGovernanceCanister.stopDissolving.mockImplementation(
        jest.fn(() => {
          throw error;
        })
      );

      const call = () =>
        stopDissolving({
          identity: mockIdentity,
          neuronId: BigInt(10),
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("splitNeuron", () => {
    const amount = BigInt(220_000_000);
    it("updates neuron successfully", async () => {
      mockGovernanceCanister.splitNeuron.mockImplementation(
        jest.fn().mockResolvedValue(BigInt(11))
      );

      await splitNeuron({
        identity: mockIdentity,
        neuronId: BigInt(10),
        amount,
      });

      expect(mockGovernanceCanister.splitNeuron).toBeCalled();
    });

    it("throws error when stopDissolving fails", async () => {
      const error = new Error();
      mockGovernanceCanister.splitNeuron.mockImplementation(
        jest.fn(() => {
          throw error;
        })
      );

      const call = () =>
        splitNeuron({
          identity: mockIdentity,
          neuronId: BigInt(10),
          amount,
        });
      expect(mockGovernanceCanister.splitNeuron).not.toBeCalled();
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("registerVote", () => {
    const neuronId = BigInt(110);
    const identity = mockIdentity;
    const proposalId = BigInt(110);

    it("should call the canister to cast vote neuronIds count", async () => {
      await registerVote({
        neuronId,
        proposalId,
        vote: Vote.Yes,
        identity,
      });
      expect(mockGovernanceCanister.registerVote).toHaveBeenCalledTimes(1);
      expect(mockGovernanceCanister.registerVote).toHaveBeenCalledWith({
        neuronId,
        proposalId,
        vote: Vote.Yes,
      });
    });
  });

  describe("queryLastestRewardEvent", () => {
    const identity = mockIdentity;

    it("should call the canister to get the latest reward", async () => {
      const certified = true;
      await queryLastestRewardEvent({
        certified,
        identity,
      });
      expect(
        mockGovernanceCanister.getLastestRewardEvent
      ).toHaveBeenCalledTimes(1);
      expect(mockGovernanceCanister.getLastestRewardEvent).toHaveBeenCalledWith(
        certified
      );
    });
  });
});
