import { get } from "svelte/store";
import * as api from "../../../lib/api/governance.api";
import * as en from "../../../lib/i18n/en.json";
import { listKnownNeurons } from "../../../lib/services/knownNeurons.services";
import { knownNeuronsStore } from "../../../lib/stores/knownNeurons.store";
import { mockIdentity } from "../../mocks/auth.store.mock";
import { mockKnownNeuron } from "../../mocks/neurons.mock";

describe("knownNeurons-services", () => {
  const spyQueryKnownNeurons = jest
    .spyOn(api, "queryKnownNeurons")
    .mockResolvedValue([mockKnownNeuron]);

  it("should list known neurons", async () => {
    await listKnownNeurons({ identity: mockIdentity });

    expect(spyQueryKnownNeurons).toHaveBeenCalled();

    const knownNeurons = get(knownNeuronsStore);
    expect(knownNeurons).toEqual([mockKnownNeuron]);
  });

  it("should not list known neurons if no identity", async () => {
    const call = async () => await listKnownNeurons({ identity: null });

    await expect(call).rejects.toThrow(Error(en.error.missing_identity));
  });
});
