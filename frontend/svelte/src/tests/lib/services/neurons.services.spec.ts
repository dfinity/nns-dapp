import { LedgerCanister } from "@dfinity/nns";
import { mock } from "jest-mock-extended";
import { get } from "svelte/store";
import * as api from "../../../lib/api/neurons.api";
import { E8S_PER_ICP } from "../../../lib/constants/icp.constants";
import {
  listNeurons,
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

  afterEach(() => spyGetNeuron.mockClear());

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

  it("should not list neurons if no identity", async () => {
    const call = async () =>
      await updateDelay({
        neuronId: BigInt(10),
        dissolveDelayInSeconds: 12000,
        identity: null,
      });

    await expect(call).rejects.toThrow("No identity");
  });
});
