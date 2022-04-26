import { GovernanceCanister, ICP, LedgerCanister, Topic } from "@dfinity/nns";
import { Principal } from "@dfinity/principal";
import { mock } from "jest-mock-extended";
import {
  addHotkey,
  disburse,
  increaseDissolveDelay,
  joinCommunityFund,
  mergeNeurons,
  queryKnownNeurons,
  queryNeuron,
  queryNeurons,
  setFollowees,
  splitNeuron,
  stakeNeuron,
  startDissolving,
  stopDissolving,
} from "../../../lib/api/governance.api";
import { mockMainAccount } from "../../mocks/accounts.store.mock";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockNeuron } from "../../mocks/neurons.mock";

describe("neurons-api", () => {
  const mockGovernanceCanister = mock<GovernanceCanister>();
  beforeEach(() => {
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
    jest
      .spyOn(GovernanceCanister, "create")
      .mockImplementation(() => mockGovernanceCanister);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("stakeNeuron creates a new neuron", async () => {
    jest
      .spyOn(LedgerCanister, "create")
      .mockImplementation(() => mock<LedgerCanister>());

    await stakeNeuron({
      stake: ICP.fromString("2") as ICP,
      identity: mockIdentity,
    });

    expect(mockGovernanceCanister.stakeNeuron).toBeCalled();
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

    it("throws error when setting followees fails", async () => {
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
    it("updates neuron successfully", async () => {
      mockGovernanceCanister.splitNeuron.mockImplementation(
        jest.fn().mockResolvedValue(BigInt(11))
      );

      await splitNeuron({
        identity: mockIdentity,
        neuronId: BigInt(10),
        amount: ICP.fromString("2.2") as ICP,
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
          amount: ICP.fromString("2.2") as ICP,
        });
      expect(mockGovernanceCanister.splitNeuron).not.toBeCalled();
      await expect(call).rejects.toThrow(error);
    });
  });
});
