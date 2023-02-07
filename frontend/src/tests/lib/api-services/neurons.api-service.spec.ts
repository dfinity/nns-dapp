import { neuronsApiService } from "$lib/api-services/neurons.api-service";
import * as api from "$lib/api/governance.api";
import { Topic } from "@dfinity/nns";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import { mockIdentity, mockPrincipal } from "../../mocks/auth.store.mock";

jest.mock("$lib/api/governance.api");

describe("neurons api-service", () => {
  const neuronId = BigInt(12);

  // Read calls
  describe("queryNeuron", () => {
    it("should call queryNeuron api", () => {
      const params = { neuronId, identity: mockIdentity, certified: true };
      neuronsApiService.queryNeuron(params);
      expect(api.queryNeuron).toHaveBeenCalledWith(params);
      expect(api.queryNeuron).toHaveBeenCalledTimes(1);
    });
  });
  describe("queryNeurons", () => {
    it("should call queryNeurons api", () => {
      const params = { identity: mockIdentity, certified: true };
      neuronsApiService.queryNeurons(params);
      expect(api.queryNeurons).toHaveBeenCalledWith(params);
      expect(api.queryNeurons).toHaveBeenCalledTimes(1);
    });
  });
  describe("queryKnownNeurons", () => {
    it("should call queryKnownNeurons api", () => {
      const params = { identity: mockIdentity, certified: true };
      neuronsApiService.queryKnownNeurons(params);
      expect(api.queryKnownNeurons).toHaveBeenCalledWith(params);
      expect(api.queryKnownNeurons).toHaveBeenCalledTimes(1);
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
      expect(api.addHotkey).toHaveBeenCalledWith(params);
      expect(api.addHotkey).toHaveBeenCalledTimes(1);
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
      expect(api.autoStakeMaturity).toHaveBeenCalledWith(params);
      expect(api.autoStakeMaturity).toHaveBeenCalledTimes(1);
    });
  });
  describe("claimOrRefreshNeuron", () => {
    it("should call claimOrRefreshNeuron api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
      };
      neuronsApiService.claimOrRefreshNeuron(params);
      expect(api.claimOrRefreshNeuron).toHaveBeenCalledWith(params);
      expect(api.claimOrRefreshNeuron).toHaveBeenCalledTimes(1);
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
      expect(api.disburse).toHaveBeenCalledWith(params);
      expect(api.disburse).toHaveBeenCalledTimes(1);
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
      expect(api.increaseDissolveDelay).toHaveBeenCalledWith(params);
      expect(api.increaseDissolveDelay).toHaveBeenCalledTimes(1);
    });
  });
  describe("joinCommunityFund", () => {
    it("should call joinCommunityFund api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
      };
      neuronsApiService.joinCommunityFund(params);
      expect(api.joinCommunityFund).toHaveBeenCalledWith(params);
      expect(api.joinCommunityFund).toHaveBeenCalledTimes(1);
    });
  });
  describe("leaveCommunityFund", () => {
    it("should call leaveCommunityFund api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
      };
      neuronsApiService.leaveCommunityFund(params);
      expect(api.leaveCommunityFund).toHaveBeenCalledWith(params);
      expect(api.leaveCommunityFund).toHaveBeenCalledTimes(1);
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
      expect(api.mergeMaturity).toHaveBeenCalledWith(params);
      expect(api.mergeMaturity).toHaveBeenCalledTimes(1);
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
      expect(api.mergeNeurons).toHaveBeenCalledWith(params);
      expect(api.mergeNeurons).toHaveBeenCalledTimes(1);
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
      expect(api.removeHotkey).toHaveBeenCalledWith(params);
      expect(api.removeHotkey).toHaveBeenCalledTimes(1);
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
      expect(api.setFollowees).toHaveBeenCalledWith(params);
      expect(api.setFollowees).toHaveBeenCalledTimes(1);
    });
  });
  describe("spawnNeuron", () => {
    it("should call spawnNeuron api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
      };
      neuronsApiService.spawnNeuron(params);
      expect(api.spawnNeuron).toHaveBeenCalledWith(params);
      expect(api.spawnNeuron).toHaveBeenCalledTimes(1);
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
      expect(api.splitNeuron).toHaveBeenCalledWith(params);
      expect(api.splitNeuron).toHaveBeenCalledTimes(1);
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
      expect(api.stakeMaturity).toHaveBeenCalledWith(params);
      expect(api.stakeMaturity).toHaveBeenCalledTimes(1);
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
      expect(api.stakeNeuron).toHaveBeenCalledWith(params);
      expect(api.stakeNeuron).toHaveBeenCalledTimes(1);
    });
  });
  describe("startDissolving", () => {
    it("should call startDissolving api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
      };
      neuronsApiService.startDissolving(params);
      expect(api.startDissolving).toHaveBeenCalledWith(params);
      expect(api.startDissolving).toHaveBeenCalledTimes(1);
    });
  });
  describe("stopDissolving", () => {
    it("should call stopDissolving api", () => {
      const params = {
        neuronId,
        identity: mockIdentity,
      };
      neuronsApiService.stopDissolving(params);
      expect(api.stopDissolving).toHaveBeenCalledWith(params);
      expect(api.stopDissolving).toHaveBeenCalledTimes(1);
    });
  });
});
