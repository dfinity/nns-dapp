import type { NeuronInfo } from "@dfinity/nns";
import { LedgerCanister } from "@dfinity/nns";
import { mock } from "jest-mock-extended";
import { get } from "svelte/store";
import * as api from "../../../lib/api/neurons.api";
import { E8S_PER_ICP } from "../../../lib/constants/icp.constants";
import {
  getNeuronId,
  listNeurons,
  loadNeuron,
  stakeAndLoadNeuron,
  updateDelay,
} from "../../../lib/services/neurons.services";
import { neuronsStore } from "../../../lib/stores/neurons.store";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockNeuron } from "../../mocks/neurons.mock";

describe("neurons-services", () => {
  const spyStakeNeuron = jest
    .spyOn(api, "stakeNeuron")
    .mockImplementation(() => Promise.resolve(mockNeuron.neuronId));

  const spyGetNeuron = jest
    .spyOn(api, "queryNeuron")
    .mockImplementation(() => Promise.resolve(mockNeuron));

  const neurons = [mockNeuron, { ...mockNeuron, neuronId: BigInt(2) }];

  const spyQueryNeurons = jest
    .spyOn(api, "queryNeurons")
    .mockImplementation(() => Promise.resolve(neurons));

  const spyIncreaseDissolveDelay = jest
    .spyOn(api, "increaseDissolveDelay")
    .mockImplementation(() => Promise.resolve());

  afterEach(() => {
    spyGetNeuron.mockClear();
    neuronsStore.setNeurons([]);
  });

  describe("stake new neuron", () => {
    it("should stake and load a neuron", async () => {
      await stakeAndLoadNeuron({ amount: 10, identity: mockIdentity });

      expect(spyStakeNeuron).toHaveBeenCalled();

      const neuron = get(neuronsStore)[0];
      expect(neuron).toEqual(mockNeuron);
    });

    it(`stakeNeuron should raise an error if amount less than ${
      E8S_PER_ICP / E8S_PER_ICP
    } ICP`, async () => {
      jest
        .spyOn(LedgerCanister, "create")
        .mockImplementation(() => mock<LedgerCanister>());

      const call = () =>
        stakeAndLoadNeuron({
          amount: 0.1,
          identity: mockIdentity,
        });

      await expect(call).rejects.toThrow(Error);
    });

    it("should not stake neuron if no identity", async () => {
      const call = async () =>
        await stakeAndLoadNeuron({ amount: 10, identity: null });

      await expect(call).rejects.toThrow(Error("No identity"));
    });
  });

  describe("list neurons", () => {
    it("should list neurons", async () => {
      await listNeurons({ identity: mockIdentity });

      expect(spyQueryNeurons).toHaveBeenCalled();

      const neuronsList = get(neuronsStore);
      expect(neuronsList).toEqual(neurons);
    });

    it("should not list neurons if no identity", async () => {
      const call = async () => await listNeurons({ identity: null });

      await expect(call).rejects.toThrow("No identity found listing neurons");
    });
  });

  describe("update delay", () => {
    it("should update delay", async () => {
      await updateDelay({
        neuronId: BigInt(10),
        dissolveDelayInSeconds: 12000,
        identity: mockIdentity,
      });

      expect(spyIncreaseDissolveDelay).toHaveBeenCalled();

      const neuron = get(neuronsStore)[0];
      expect(neuron).toEqual(mockNeuron);
    });

    it("should not update delay if no identity", async () => {
      const call = async () =>
        await updateDelay({
          neuronId: BigInt(10),
          dissolveDelayInSeconds: 12000,
          identity: null,
        });

      await expect(call).rejects.toThrow("No identity");
    });
  });

  describe("details", () => {
    beforeAll(() => {
      // Avoid to print errors during test
      jest.spyOn(console, "error").mockImplementation(() => undefined);
    });
    afterAll(() => jest.clearAllMocks());
    it("should get neuronId from valid path", async () => {
      expect(getNeuronId("/#/neuron/123")).toBe(BigInt(123));
      expect(getNeuronId("/#/neuron/0")).toBe(BigInt(0));
    });

    it("should not get neuronId from invalid path", async () => {
      expect(getNeuronId("/#/neuron/")).toBeUndefined();
      expect(getNeuronId("/#/neuron/1.5")).toBeUndefined();
      expect(getNeuronId("/#/neuron/123n")).toBeUndefined();
    });
  });

  describe("load neuron", () => {
    it("should get neuron from neurons store if presented and not call queryNeuron", (done) => {
      neuronsStore.pushNeurons([mockNeuron]);
      loadNeuron({
        neuronId: mockNeuron.neuronId,
        identity: mockIdentity,
        setNeuron: (neuron: NeuronInfo) => {
          expect(neuron?.neuronId).toBe(mockNeuron.neuronId);
          expect(spyGetNeuron).not.toBeCalled();
          neuronsStore.setNeurons([]);
          done();
        },
      });
    });

    it("should call the api to get neuron if not in store", (done) => {
      loadNeuron({
        neuronId: mockNeuron.neuronId,
        identity: mockIdentity,
        setNeuron: () => {
          expect(spyGetNeuron).toBeCalled();
          done();
        },
      });
    });
  });
});
