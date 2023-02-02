import { neuronsApiService } from "$lib/api-services/neurons.api-service";
import {
  addHotkey,
  autoStakeMaturity,
  claimOrRefreshNeuron,
  disburse,
  increaseDissolveDelay,
  joinCommunityFund,
  leaveCommunityFund,
  mergeMaturity,
  mergeNeurons,
  queryKnownNeurons,
  queryNeuron,
  queryNeurons,
  removeHotkey,
  setFollowees,
  spawnNeuron,
  splitNeuron,
  stakeMaturity,
  stakeNeuron,
  startDissolving,
  stopDissolving,
} from "$lib/api/governance.api";
import { Topic } from "@dfinity/nns";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import { mockIdentity, mockPrincipal } from "../../mocks/auth.store.mock";

jest.mock("$lib/api/governance.api", () => {
  return {
    addHotkey: jest.fn(),
    autoStakeMaturity: jest.fn(),
    claimOrRefreshNeuron: jest.fn(),
    disburse: jest.fn(),
    increaseDissolveDelay: jest.fn(),
    joinCommunityFund: jest.fn(),
    leaveCommunityFund: jest.fn(),
    mergeMaturity: jest.fn(),
    mergeNeurons: jest.fn(),
    queryKnownNeurons: jest.fn(),
    queryNeuron: jest.fn(),
    queryNeurons: jest.fn(),
    removeHotkey: jest.fn(),
    setFollowees: jest.fn(),
    spawnNeuron: jest.fn(),
    splitNeuron: jest.fn(),
    stakeMaturity: jest.fn(),
    stakeNeuron: jest.fn(),
    startDissolving: jest.fn(),
    stopDissolving: jest.fn(),
  };
});

describe("neurons api-service", () => {
  const neuronId = BigInt(12);

  // Read calls
  describe("queryNeuron", () => {
    it("should call queryNeuron api", () => {
      const params = { neuronId, identity: mockIdentity, certified: true };
      neuronsApiService.queryNeuron(params);
      expect(queryNeuron).toHaveBeenCalledWith(params);
      expect(queryNeuron).toHaveBeenCalledTimes(1);
    });
  });
  describe("queryNeurons", () => {
    it("should call queryNeurons api", () => {
      const params = { identity: mockIdentity, certified: true };
      neuronsApiService.queryNeurons(params);
      expect(queryNeurons).toHaveBeenCalledWith(params);
      expect(queryNeurons).toHaveBeenCalledTimes(1);
    });
  });
  describe("queryKnownNeurons", () => {
    it("should call queryKnownNeurons api", () => {
      const params = { identity: mockIdentity, certified: true };
      neuronsApiService.queryKnownNeurons(params);
      expect(queryKnownNeurons).toHaveBeenCalledWith(params);
      expect(queryKnownNeurons).toHaveBeenCalledTimes(1);
    });
  });

  // Action calls
  describe("addHotkey", () => {
    it("should call addHotkey api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
        principal: mockPrincipal,
      };
      neuronsApiService.addHotkey(params);
      expect(addHotkey).toHaveBeenCalledWith(params);
      expect(addHotkey).toHaveBeenCalledTimes(1);
    });
  });
  describe("autoStakeMaturity", () => {
    it("should call autoStakeMaturity api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
        autoStake: true,
      };
      neuronsApiService.autoStakeMaturity(params);
      expect(autoStakeMaturity).toHaveBeenCalledWith(params);
      expect(autoStakeMaturity).toHaveBeenCalledTimes(1);
    });
  });
  describe("claimOrRefreshNeuron", () => {
    it("should call claimOrRefreshNeuron api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
      };
      neuronsApiService.claimOrRefreshNeuron(params);
      expect(claimOrRefreshNeuron).toHaveBeenCalledWith(params);
      expect(claimOrRefreshNeuron).toHaveBeenCalledTimes(1);
    });
  });
  describe("disburse", () => {
    it("should call disburse api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
        toAccount: mockMainAccount.identifier,
        amount: BigInt(10_000_000),
      };
      neuronsApiService.disburse(params);
      expect(disburse).toHaveBeenCalledWith(params);
      expect(disburse).toHaveBeenCalledTimes(1);
    });
  });
  describe("increaseDissolveDelay", () => {
    it("should call increaseDissolveDelay api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
        dissolveDelayInSeconds: 2,
      };
      neuronsApiService.increaseDissolveDelay(params);
      expect(increaseDissolveDelay).toHaveBeenCalledWith(params);
      expect(increaseDissolveDelay).toHaveBeenCalledTimes(1);
    });
  });
  describe("joinCommunityFund", () => {
    it("should call joinCommunityFund api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
      };
      neuronsApiService.joinCommunityFund(params);
      expect(joinCommunityFund).toHaveBeenCalledWith(params);
      expect(joinCommunityFund).toHaveBeenCalledTimes(1);
    });
  });
  describe("leaveCommunityFund", () => {
    it("should call leaveCommunityFund api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
      };
      neuronsApiService.leaveCommunityFund(params);
      expect(leaveCommunityFund).toHaveBeenCalledWith(params);
      expect(leaveCommunityFund).toHaveBeenCalledTimes(1);
    });
  });
  describe("mergeMaturity", () => {
    it("should call mergeMaturity api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
        percentageToMerge: 0.2,
      };
      neuronsApiService.mergeMaturity(params);
      expect(mergeMaturity).toHaveBeenCalledWith(params);
      expect(mergeMaturity).toHaveBeenCalledTimes(1);
    });
  });
  describe("mergeNeurons", () => {
    it("should call mergeNeurons api", () => {
      const params = {
        identity: mockIdentity,
        sourceNeuronId: BigInt(2),
        targetNeuronId: BigInt(20),
      };
      neuronsApiService.mergeNeurons(params);
      expect(mergeNeurons).toHaveBeenCalledWith(params);
      expect(mergeNeurons).toHaveBeenCalledTimes(1);
    });
  });
  describe("removeHotkey", () => {
    it("should call removeHotkey api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
        principal: mockPrincipal,
      };
      neuronsApiService.removeHotkey(params);
      expect(removeHotkey).toHaveBeenCalledWith(params);
      expect(removeHotkey).toHaveBeenCalledTimes(1);
    });
  });
  describe("setFollowees", () => {
    it("should call setFollowees api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
        topic: Topic.ExchangeRate,
        followees: [BigInt(2), BigInt(20)],
      };
      neuronsApiService.setFollowees(params);
      expect(setFollowees).toHaveBeenCalledWith(params);
      expect(setFollowees).toHaveBeenCalledTimes(1);
    });
  });
  describe("spawnNeuron", () => {
    it("should call spawnNeuron api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
      };
      neuronsApiService.spawnNeuron(params);
      expect(spawnNeuron).toHaveBeenCalledWith(params);
      expect(spawnNeuron).toHaveBeenCalledTimes(1);
    });
  });
  describe("splitNeuron", () => {
    it("should call splitNeuron api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
        amount: BigInt(10_000_000),
      };
      neuronsApiService.splitNeuron(params);
      expect(splitNeuron).toHaveBeenCalledWith(params);
      expect(splitNeuron).toHaveBeenCalledTimes(1);
    });
  });
  describe("stakeMaturity", () => {
    it("should call stakeMaturity api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
        percentageToStake: 0.2,
      };
      neuronsApiService.stakeMaturity(params);
      expect(stakeMaturity).toHaveBeenCalledWith(params);
      expect(stakeMaturity).toHaveBeenCalledTimes(1);
    });
  });
  describe("stakeNeuron", () => {
    it("should call stakeNeuron api", () => {
      const params = {
        identity: mockIdentity,
        stake: BigInt(10_000_000),
        controller: mockPrincipal,
        ledgerCanisterIdentity: mockIdentity,
        fromSubaccount: new Uint8Array(),
      };
      neuronsApiService.stakeNeuron(params);
      expect(stakeNeuron).toHaveBeenCalledWith(params);
      expect(stakeNeuron).toHaveBeenCalledTimes(1);
    });
  });
  describe("startDissolving", () => {
    it("should call startDissolving api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
      };
      neuronsApiService.startDissolving(params);
      expect(startDissolving).toHaveBeenCalledWith(params);
      expect(startDissolving).toHaveBeenCalledTimes(1);
    });
  });
  describe("stopDissolving", () => {
    it("should call stopDissolving api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
      };
      neuronsApiService.stopDissolving(params);
      expect(stopDissolving).toHaveBeenCalledWith(params);
      expect(stopDissolving).toHaveBeenCalledTimes(1);
    });
  });
});
