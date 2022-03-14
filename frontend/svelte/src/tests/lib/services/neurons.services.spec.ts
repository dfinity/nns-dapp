import { LedgerCanister } from "@dfinity/nns";
import { mock } from "jest-mock-extended";
import { get } from "svelte/store";
import * as api from "../../../lib/api/neurons.api";
import { E8S_PER_ICP } from "../../../lib/constants/icp.constants";
import { stakeAndLoadNeuron } from "../../../lib/services/neurons.services";
import { neuronsStore } from "../../../lib/stores/neurons.store";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockNeuron } from "../../mocks/neurons.mock";

describe("neurons-services", () => {
  const spyStakeNeuron = jest
    .spyOn(api, "stakeNeuron")
    .mockImplementation(() => Promise.resolve(mockNeuron.neuronId));

  const spyGetNeuron = jest
    .spyOn(api, "getNeuron")
    .mockImplementation(() => Promise.resolve(mockNeuron));

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
});
