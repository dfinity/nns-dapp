import { get } from "svelte/store";
import * as api from "../../../lib/api/governance.api";
import { listKnownNeurons } from "../../../lib/services/knownNeurons.services";
import { knownNeuronsStore } from "../../../lib/stores/knownNeurons.store";
import {
  mockIdentityErrorMsg,
  resetIdentity,
  setNoIdentity,
} from "../../mocks/auth.store.mock";
import { mockKnownNeuron } from "../../mocks/neurons.mock";

describe("knownNeurons-services", () => {
  const spyQueryKnownNeurons = jest
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
