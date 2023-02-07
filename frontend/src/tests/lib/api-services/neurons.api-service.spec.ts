import { neuronsApiService } from "$lib/api-services/neurons.api-service";
import * as api from "$lib/api/governance.api";
import { Topic } from "@dfinity/nns";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import {
  createMockIdentity,
  mockIdentity,
  mockPrincipal,
} from "../../mocks/auth.store.mock";
import {
  createMockKnownNeuron,
  createMockNeuron,
} from "../../mocks/neurons.mock";

jest.mock("$lib/api/governance.api");

const neuron1 = createMockNeuron(1);
const neuron2 = createMockNeuron(2);
const neurons = [neuron1, neuron2];

const identity1 = createMockIdentity(1);
const identity2 = createMockIdentity(2);
const unknownIdentity = createMockIdentity(999);

const knownNeuron1 = createMockKnownNeuron(1001);
const knownNeuron2 = createMockKnownNeuron(1002);

describe("neurons api-service", () => {
  const neuronId = BigInt(12);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Read calls

  describe("queryNeuron", () => {
    beforeEach(() => {
      jest
        .spyOn(api, "queryNeuron")
        .mockImplementation(
          async ({
            neuronId,
            identity,
            certified,
          }: api.ApiQueryNeuronParams) => {
            const neuron = neurons.find((n) => n.neuronId == neuronId);
            if (!neuron) {
              throw new Error(`No neuron with id ${neuronId}`);
            }
            return neuron;
          }
        );
    });

    const params = { identity: mockIdentity, certified: true };

    it("should call queryNeuron api", async () => {
      expect(
        await neuronsApiService.queryNeuron({ neuronId: BigInt(1), ...params })
      ).toEqual(neuron1);
      expect(
        await neuronsApiService.queryNeuron({ neuronId: BigInt(2), ...params })
      ).toEqual(neuron2);
      expect(api.queryNeuron).toHaveBeenCalledTimes(2);
    });

    it("should fail if queryNeuron api fails", async () => {
      expect(() =>
        neuronsApiService.queryNeuron({ neuronId: BigInt(999), ...params })
      ).rejects.toThrow("No neuron with id 999");
      expect(api.queryNeuron).toHaveBeenCalledTimes(1);
    });
  });

  describe("queryNeurons", () => {
    beforeEach(() => {
      jest
        .spyOn(api, "queryNeurons")
        .mockImplementation(
          async ({ identity, certified }: api.ApiQueryParams) => {
            if (identity === identity1) {
              return [neuron1];
            }
            if (identity === identity2) {
              return [neuron2];
            }
            throw new Error(`Unknown identity: ${identity.getPrincipal()}`);
          }
        );
    });

    const params = { certified: true };

    it("should call queryNeurons api", async () => {
      expect(
        await neuronsApiService.queryNeurons({ identity: identity1, ...params })
      ).toEqual([neuron1]);
      expect(
        await neuronsApiService.queryNeurons({ identity: identity2, ...params })
      ).toEqual([neuron2]);
      expect(api.queryNeurons).toHaveBeenCalledTimes(2);
    });

    it("should fail if queryNeurons api fails", async () => {
      expect(() =>
        neuronsApiService.queryNeurons({ identity: unknownIdentity, ...params })
      ).rejects.toThrow("Unknown identity");
      expect(api.queryNeurons).toHaveBeenCalledTimes(1);
    });
  });

  describe("queryKnownNeurons", () => {
    beforeEach(() => {
      jest
        .spyOn(api, "queryKnownNeurons")
        .mockImplementation(
          async ({ identity, certified }: api.ApiQueryParams) => {
            if (identity === identity1) {
              return [knownNeuron1];
            }
            if (identity === identity2) {
              return [knownNeuron2];
            }
            throw new Error(`Unknown identity: ${identity.getPrincipal()}`);
          }
        );
    });

    const params = { certified: true };

    it("should call queryKnownNeurons api", async () => {
      expect(
        await neuronsApiService.queryKnownNeurons({
          identity: identity1,
          ...params,
        })
      ).toEqual([knownNeuron1]);
      expect(
        await neuronsApiService.queryKnownNeurons({
          identity: identity2,
          ...params,
        })
      ).toEqual([knownNeuron2]);
      expect(api.queryKnownNeurons).toHaveBeenCalledTimes(2);
    });

    it("should fail if queryKnownNeurons api fails", async () => {
      expect(() =>
        neuronsApiService.queryKnownNeurons({
          identity: unknownIdentity,
          ...params,
        })
      ).rejects.toThrow("Unknown identity");
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
    it("should call claimOrRefreshNeuron api", async () => {
      const params = {
        neuronId,
        identity: mockIdentity,
      };
      jest
        .spyOn(api, "claimOrRefreshNeuron")
        .mockImplementationOnce(async () => neuronId);
      expect(await neuronsApiService.claimOrRefreshNeuron(params)).toEqual(
        neuronId
      );
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
    it("should call spawnNeuron api", async () => {
      const params = {
        neuronId,
        identity: mockIdentity,
      };
      jest
        .spyOn(api, "spawnNeuron")
        .mockImplementationOnce(async () => neuronId);
      expect(await neuronsApiService.spawnNeuron(params)).toEqual(neuronId);
      expect(api.spawnNeuron).toHaveBeenCalledWith(params);
      expect(api.spawnNeuron).toHaveBeenCalledTimes(1);
    });
  });

  describe("splitNeuron", () => {
    it("should call splitNeuron api", async () => {
      const params = {
        neuronId,
        identity: mockIdentity,
        amount: BigInt(10_000_000),
      };
      jest
        .spyOn(api, "splitNeuron")
        .mockImplementationOnce(async () => neuronId);
      expect(await neuronsApiService.splitNeuron(params)).toEqual(neuronId);
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
    it("should call stakeNeuron api", async () => {
      const params = {
        identity: mockIdentity,
        stake: BigInt(10_000_000),
        controller: mockPrincipal,
        ledgerCanisterIdentity: mockIdentity,
        fromSubaccount: new Uint8Array(),
      };
      jest
        .spyOn(api, "stakeNeuron")
        .mockImplementationOnce(async () => neuronId);
      expect(await neuronsApiService.stakeNeuron(params)).toEqual(neuronId);
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
