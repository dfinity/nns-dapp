import {
  addHotkey,
  autoStakeMaturity,
  changeNeuronVisibility,
  claimOrRefreshNeuronByMemo,
  disburse,
  increaseDissolveDelay,
  joinCommunityFund,
  leaveCommunityFund,
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
  startDissolving,
  stopDissolving,
} from "$lib/api/governance.api";
import { mockIdentity, mockPrincipal } from "$tests/mocks/auth.store.mock";
import { mockMainAccount } from "$tests/mocks/icp-accounts.store.mock";
import { mockNeuron } from "$tests/mocks/neurons.mock";
import type { Agent } from "@dfinity/agent";
import { LedgerCanister } from "@dfinity/ledger-icp";
import {
  GovernanceCanister,
  NeuronVisibility,
  Topic,
  Vote,
} from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { mock } from "vitest-mock-extended";

vi.mock("$lib/api/agent.api", () => {
  return {
    createAgent: () => Promise.resolve(mock<Agent>()),
  };
});

describe("neurons-api", () => {
  const mockGovernanceCanister = mock<GovernanceCanister>();
  beforeEach(() => {
    vi.resetAllMocks();

    mockGovernanceCanister.listNeurons.mockImplementation(
      vi.fn().mockResolvedValue([])
    );
    mockGovernanceCanister.listKnownNeurons.mockImplementation(
      vi.fn().mockResolvedValue([])
    );
    mockGovernanceCanister.stakeNeuron.mockImplementation(undefined);
    mockGovernanceCanister.getNeuron.mockImplementation(
      vi.fn().mockResolvedValue(mockNeuron)
    );
    mockGovernanceCanister.registerVote.mockResolvedValue(undefined);
    vi.spyOn(GovernanceCanister, "create").mockImplementation(
      () => mockGovernanceCanister
    );
  });

  it("stakeNeuron creates a new neuron", async () => {
    vi.spyOn(LedgerCanister, "create").mockImplementation(() =>
      mock<LedgerCanister>()
    );

    expect(mockGovernanceCanister.stakeNeuron).not.toBeCalled();

    const stake = 20_000_000n;
    const controller = mockIdentity.getPrincipal();
    const fromSubAccount = [2, 3, 4];
    const fee = 10_000n;

    await stakeNeuron({
      stake,
      controller,
      ledgerCanisterIdentity: mockIdentity,
      identity: mockIdentity,
      fromSubAccount,
      fee,
    });

    expect(mockGovernanceCanister.stakeNeuron).toBeCalledTimes(1);
    expect(mockGovernanceCanister.stakeNeuron).toBeCalledWith(
      expect.objectContaining({
        stake,
        principal: controller,
        fromSubAccount,
        fee,
      })
    );
  });

  it("queryNeurons fetches neurons", async () => {
    expect(mockGovernanceCanister.listNeurons).not.toBeCalled();

    await queryNeurons({
      identity: mockIdentity,
      certified: false,
      includeEmptyNeurons: false,
    });

    expect(mockGovernanceCanister.listNeurons).toBeCalledWith({
      certified: false,
      includeEmptyNeurons: false,
    });
    expect(mockGovernanceCanister.listNeurons).toBeCalledTimes(1);
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
        vi.fn().mockResolvedValue(undefined)
      );

      await increaseDissolveDelay({
        neuronId: 10n,
        dissolveDelayInSeconds: 12000,
        identity: mockIdentity,
      });

      expect(mockGovernanceCanister.increaseDissolveDelay).toBeCalled();
    });

    it("throws error when updating neuron fails", async () => {
      const error = new Error();
      mockGovernanceCanister.increaseDissolveDelay.mockImplementation(
        vi.fn(() => {
          throw error;
        })
      );

      const call = () =>
        increaseDissolveDelay({
          neuronId: 10n,
          dissolveDelayInSeconds: 12000,
          identity: mockIdentity,
        });

      await expect(call).rejects.toThrow(error);
    });
  });

  describe("setFollowees", () => {
    it("updates neuron successfully", async () => {
      mockGovernanceCanister.setFollowees.mockImplementation(
        vi.fn().mockResolvedValue(undefined)
      );

      await setFollowees({
        identity: mockIdentity,
        neuronId: 10n,
        topic: Topic.ExchangeRate,
        followees: [4n, 7n],
      });

      expect(mockGovernanceCanister.setFollowees).toBeCalled();
    });

    it("throws error when setting followees fails", async () => {
      const error = new Error();
      mockGovernanceCanister.setFollowees.mockImplementation(
        vi.fn(() => {
          throw error;
        })
      );

      const call = () =>
        setFollowees({
          identity: mockIdentity,
          neuronId: 10n,
          topic: Topic.ExchangeRate,
          followees: [4n, 7n],
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("joinCommunityFund", () => {
    it("updates neuron successfully", async () => {
      mockGovernanceCanister.joinCommunityFund.mockImplementation(
        vi.fn().mockResolvedValue(undefined)
      );

      await joinCommunityFund({
        identity: mockIdentity,
        neuronId: 10n,
      });

      expect(mockGovernanceCanister.joinCommunityFund).toBeCalled();
    });

    it("throws error when joining community fund fails", async () => {
      const error = new Error();
      mockGovernanceCanister.joinCommunityFund.mockImplementation(
        vi.fn(() => {
          throw error;
        })
      );

      const call = () =>
        joinCommunityFund({
          identity: mockIdentity,
          neuronId: 10n,
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("leaveCommunityFund", () => {
    it("updates neuron successfully", async () => {
      mockGovernanceCanister.leaveCommunityFund.mockImplementation(
        vi.fn().mockResolvedValue(undefined)
      );

      await leaveCommunityFund({
        identity: mockIdentity,
        neuronId: 10n,
      });

      expect(mockGovernanceCanister.leaveCommunityFund).toBeCalled();
    });

    it("throws error when leaving community fund fails", async () => {
      const error = new Error();
      mockGovernanceCanister.leaveCommunityFund.mockImplementation(
        vi.fn(() => {
          throw error;
        })
      );

      const call = () =>
        leaveCommunityFund({
          identity: mockIdentity,
          neuronId: 10n,
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("disburse", () => {
    it("disburses neuron successfully", async () => {
      mockGovernanceCanister.disburse.mockImplementation(
        vi.fn().mockResolvedValue(undefined)
      );

      await disburse({
        identity: mockIdentity,
        toAccountId: mockMainAccount.identifier,
        neuronId: 10n,
      });

      expect(mockGovernanceCanister.disburse).toBeCalled();
    });

    it("throws error when disburse fails", async () => {
      const error = new Error();
      mockGovernanceCanister.disburse.mockImplementation(
        vi.fn(() => {
          throw error;
        })
      );

      const call = () =>
        disburse({
          identity: mockIdentity,
          toAccountId: mockMainAccount.identifier,
          neuronId: 10n,
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("stakeMaturity", () => {
    it("stake the maturity of a neuron successfully", async () => {
      mockGovernanceCanister.stakeMaturity.mockImplementation(
        vi.fn().mockResolvedValue(undefined)
      );

      await stakeMaturity({
        identity: mockIdentity,
        percentageToStake: 50,
        neuronId: 10n,
      });

      expect(mockGovernanceCanister.stakeMaturity).toBeCalled();
    });

    it("throws error when stakeMaturity fails", async () => {
      const error = new Error();
      mockGovernanceCanister.stakeMaturity.mockImplementation(
        vi.fn(() => {
          throw error;
        })
      );

      const call = () =>
        stakeMaturity({
          identity: mockIdentity,
          percentageToStake: 50,
          neuronId: 10n,
        });

      await expect(call).rejects.toThrow(error);
    });
  });

  describe("autoStakeMaturity", () => {
    it("auto stake the maturity of a neuron successfully", async () => {
      mockGovernanceCanister.autoStakeMaturity.mockImplementation(
        vi.fn().mockResolvedValue(undefined)
      );

      await autoStakeMaturity({
        identity: mockIdentity,
        autoStake: true,
        neuronId: 10n,
      });

      expect(mockGovernanceCanister.autoStakeMaturity).toBeCalled();
    });

    it("throws error when autoStakeMaturity fails", async () => {
      const error = new Error();
      mockGovernanceCanister.autoStakeMaturity.mockImplementation(
        vi.fn(() => {
          throw error;
        })
      );

      const call = () =>
        autoStakeMaturity({
          identity: mockIdentity,
          autoStake: true,
          neuronId: 10n,
        });

      await expect(call).rejects.toThrow(error);
    });

    it("should enable auto stake the maturity of a neuron", async () => {
      mockGovernanceCanister.autoStakeMaturity.mockImplementation(
        vi.fn().mockResolvedValue(undefined)
      );

      const expected = {
        autoStake: true,
        neuronId: 10n,
      };

      await autoStakeMaturity({
        identity: mockIdentity,
        ...expected,
      });

      expect(mockGovernanceCanister.autoStakeMaturity).toBeCalledWith(expected);
    });

    it("should disable auto stake the maturity of a neuron", async () => {
      mockGovernanceCanister.autoStakeMaturity.mockImplementation(
        vi.fn().mockResolvedValue(undefined)
      );

      const expected = {
        autoStake: false,
        neuronId: 10n,
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
      const newNeuronId = 12_333n;
      mockGovernanceCanister.spawnNeuron.mockImplementation(
        vi.fn().mockResolvedValue(newNeuronId)
      );

      const actualNeuronId = await spawnNeuron({
        identity: mockIdentity,
        percentageToSpawn: 50,
        neuronId: 10n,
      });

      expect(mockGovernanceCanister.spawnNeuron).toBeCalled();
      expect(actualNeuronId).toEqual(newNeuronId);
    });

    it("throws error when spawnNeuron fails", async () => {
      const error = new Error();
      mockGovernanceCanister.spawnNeuron.mockImplementation(
        vi.fn(() => {
          throw error;
        })
      );

      const call = () =>
        spawnNeuron({
          identity: mockIdentity,
          percentageToSpawn: 50,
          neuronId: 10n,
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("merge", () => {
    it("merges neurons successfully", async () => {
      mockGovernanceCanister.mergeNeurons.mockImplementation(
        vi.fn().mockResolvedValue(undefined)
      );

      await mergeNeurons({
        identity: mockIdentity,
        sourceNeuronId: 10n,
        targetNeuronId: 11n,
      });

      expect(mockGovernanceCanister.mergeNeurons).toBeCalled();
    });

    it("throws error when merging neurons fails", async () => {
      const error = new Error();
      mockGovernanceCanister.mergeNeurons.mockImplementation(
        vi.fn(() => {
          throw error;
        })
      );

      const call = () =>
        mergeNeurons({
          identity: mockIdentity,
          sourceNeuronId: 10n,
          targetNeuronId: 11n,
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("simulate merge neurons", () => {
    it("simulates merging neurons successfully", async () => {
      mockGovernanceCanister.simulateMergeNeurons.mockImplementation(
        vi.fn().mockResolvedValue(undefined)
      );

      await simulateMergeNeurons({
        identity: mockIdentity,
        sourceNeuronId: 10n,
        targetNeuronId: 11n,
      });

      expect(mockGovernanceCanister.simulateMergeNeurons).toBeCalled();
    });

    it("throws error when simulating merging fails", async () => {
      const error = new Error();
      mockGovernanceCanister.simulateMergeNeurons.mockImplementation(
        vi.fn(() => {
          throw error;
        })
      );

      const call = () =>
        simulateMergeNeurons({
          identity: mockIdentity,
          sourceNeuronId: 10n,
          targetNeuronId: 11n,
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("addHotkey", () => {
    it("updates neuron successfully", async () => {
      mockGovernanceCanister.addHotkey.mockImplementation(
        vi.fn().mockResolvedValue(undefined)
      );

      await addHotkey({
        identity: mockIdentity,
        neuronId: 10n,
        principal: Principal.fromText("aaaaa-aa"),
      });

      expect(mockGovernanceCanister.addHotkey).toBeCalled();
    });

    it("throws error when adding hotkey fails", async () => {
      const error = new Error();
      mockGovernanceCanister.addHotkey.mockImplementation(
        vi.fn(() => {
          throw error;
        })
      );

      const call = () =>
        addHotkey({
          identity: mockIdentity,
          neuronId: 10n,
          principal: Principal.fromText("aaaaa-aa"),
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("removeHotkey", () => {
    it("updates neuron successfully", async () => {
      mockGovernanceCanister.removeHotkey.mockImplementation(
        vi.fn().mockResolvedValue(undefined)
      );

      await removeHotkey({
        identity: mockIdentity,
        neuronId: 10n,
        principal: Principal.fromText("aaaaa-aa"),
      });

      expect(mockGovernanceCanister.removeHotkey).toBeCalled();
    });

    it("throws error when removing hotkey fails", async () => {
      const error = new Error();
      mockGovernanceCanister.removeHotkey.mockImplementation(
        vi.fn(() => {
          throw error;
        })
      );

      const call = () =>
        removeHotkey({
          identity: mockIdentity,
          neuronId: 10n,
          principal: Principal.fromText("aaaaa-aa"),
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("startDissolving", () => {
    it("updates neuron successfully", async () => {
      mockGovernanceCanister.startDissolving.mockImplementation(
        vi.fn().mockResolvedValue(undefined)
      );

      await startDissolving({
        identity: mockIdentity,
        neuronId: 10n,
      });

      expect(mockGovernanceCanister.startDissolving).toBeCalled();
    });

    it("throws error when startDissolving fails", async () => {
      const error = new Error();
      mockGovernanceCanister.startDissolving.mockImplementation(
        vi.fn(() => {
          throw error;
        })
      );

      const call = () =>
        startDissolving({
          identity: mockIdentity,
          neuronId: 10n,
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("stopDissolving", () => {
    it("updates neuron successfully", async () => {
      mockGovernanceCanister.stopDissolving.mockImplementation(
        vi.fn().mockResolvedValue(undefined)
      );

      await stopDissolving({
        identity: mockIdentity,
        neuronId: 10n,
      });

      expect(mockGovernanceCanister.stopDissolving).toBeCalled();
    });

    it("throws error when stopDissolving fails", async () => {
      const error = new Error();
      mockGovernanceCanister.stopDissolving.mockImplementation(
        vi.fn(() => {
          throw error;
        })
      );

      const call = () =>
        stopDissolving({
          identity: mockIdentity,
          neuronId: 10n,
        });
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("splitNeuron", () => {
    const amount = 220_000_000n;
    it("updates neuron successfully", async () => {
      mockGovernanceCanister.splitNeuron.mockImplementation(
        vi.fn().mockResolvedValue(11n)
      );

      await splitNeuron({
        identity: mockIdentity,
        neuronId: 10n,
        amount,
      });

      expect(mockGovernanceCanister.splitNeuron).toBeCalled();
    });

    it("throws error when stopDissolving fails", async () => {
      const error = new Error();
      mockGovernanceCanister.splitNeuron.mockImplementation(
        vi.fn(() => {
          throw error;
        })
      );

      const call = () =>
        splitNeuron({
          identity: mockIdentity,
          neuronId: 10n,
          amount,
        });
      expect(mockGovernanceCanister.splitNeuron).not.toBeCalled();
      await expect(call).rejects.toThrow(error);
    });
  });

  describe("registerVote", () => {
    const neuronId = 110n;
    const identity = mockIdentity;
    const proposalId = 110n;

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

  describe("changeNeuronVisibility", () => {
    const neuronIds = [10n, 20n, 30n];
    const visibility = NeuronVisibility.Public;

    it("changes visibility for multiple neurons", async () => {
      expect(mockGovernanceCanister.setVisibility).not.toHaveBeenCalled();

      mockGovernanceCanister.setVisibility.mockResolvedValue(undefined);

      await changeNeuronVisibility({
        neuronIds,
        visibility,
        identity: mockIdentity,
      });

      expect(mockGovernanceCanister.setVisibility).toHaveBeenCalledTimes(3);
      neuronIds.forEach((neuronId) => {
        expect(mockGovernanceCanister.setVisibility).toHaveBeenCalledWith(
          neuronId,
          visibility
        );
      });
    });

    it("throws error when changing visibility fails", async () => {
      expect(mockGovernanceCanister.setVisibility).not.toHaveBeenCalled();

      const error = new Error("Visibility change failed");
      mockGovernanceCanister.setVisibility.mockRejectedValue(error);

      await expect(
        changeNeuronVisibility({
          neuronIds,
          visibility,
          identity: mockIdentity,
        })
      ).rejects.toThrow(error);

      expect(mockGovernanceCanister.setVisibility).toHaveBeenCalledTimes(3);
    });
  });

  describe("claimOrRefreshNeuronByMemo", () => {
    const memo = 555n;
    const controller = mockPrincipal;
    const neuronId = 7n;

    it("should call the canister to claim or refresh neuron by memo", async () => {
      mockGovernanceCanister.claimOrRefreshNeuronFromAccount.mockResolvedValue(
        neuronId
      );

      expect(
        mockGovernanceCanister.claimOrRefreshNeuronFromAccount
      ).toBeCalledTimes(0);

      expect(
        await claimOrRefreshNeuronByMemo({
          memo,
          controller,
          identity: mockIdentity,
        })
      ).toBe(neuronId);

      expect(
        mockGovernanceCanister.claimOrRefreshNeuronFromAccount
      ).toBeCalledTimes(1);
      expect(
        mockGovernanceCanister.claimOrRefreshNeuronFromAccount
      ).toBeCalledWith({
        memo,
        controller,
      });
    });

    it("should throw when canister call throws", async () => {
      const error = new Error("Not enough balance");
      mockGovernanceCanister.claimOrRefreshNeuronFromAccount.mockRejectedValue(
        error
      );

      expect(
        mockGovernanceCanister.claimOrRefreshNeuronFromAccount
      ).toBeCalledTimes(0);

      const call = () =>
        claimOrRefreshNeuronByMemo({
          memo,
          controller,
          identity: mockIdentity,
        });

      await expect(call).rejects.toThrow(error);

      expect(
        mockGovernanceCanister.claimOrRefreshNeuronFromAccount
      ).toBeCalledTimes(1);
      expect(
        mockGovernanceCanister.claimOrRefreshNeuronFromAccount
      ).toBeCalledWith({
        memo,
        controller,
      });
    });
  });
});
