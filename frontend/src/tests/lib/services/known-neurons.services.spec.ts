import * as api from "$lib/api/governance.api";
import { listKnownNeurons } from "$lib/services/known-neurons.services";
import { knownNeuronsStore } from "$lib/stores/known-neurons.store";
import {
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "$tests/mocks/auth.store.mock";
import { mockKnownNeuron } from "$tests/mocks/neurons.mock";
import { get } from "svelte/store";

describe("knownNeurons-services", () => {
  const spyQueryKnownNeurons = vi
    .spyOn(api, "queryKnownNeurons")
    .mockResolvedValue([mockKnownNeuron]);

  it("should list known neurons", async () => {
    await listKnownNeurons();

    expect(spyQueryKnownNeurons).toHaveBeenCalled();

    const knownNeurons = get(knownNeuronsStore);
    expect(knownNeurons).toEqual([mockKnownNeuron]);
  });

  it("should not list known neurons if no identity", async () => {
    setNoIdentity();

    const call = async () => await listKnownNeurons();

    await expect(call).rejects.toThrow(Error(mockIdentityErrorMsg));

    resetIdentity();
  });
});
