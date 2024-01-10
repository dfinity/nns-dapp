import { addMaturity as addMaturityApi } from "$lib/api/dev.api";
import { getSnsNeuronIdentity } from "$lib/services/sns-neurons.services";
import { toastsError, toastsSuccess } from "$lib/stores/toasts.store";
import type { E8s } from "@dfinity/nns";
import type { Principal } from "@dfinity/principal";
import type { SnsNeuronId } from "@dfinity/sns";

export const addMaturity = async ({
  neuronId,
  amountE8s,
  rootCanisterId,
}: {
  neuronId: SnsNeuronId;
  amountE8s: E8s;
  rootCanisterId: Principal;
}): Promise<void> => {
  try {
    const identity = await getSnsNeuronIdentity();

    await addMaturityApi({
      neuronId,
      amountE8s,
      rootCanisterId,
      identity,
    });

    toastsSuccess({
      labelKey: "neuron_detail.add_maturity_success",
    });
  } catch (err) {
    toastsError({
      labelKey: "error.add_maturity",
      err,
    });
  }
};
