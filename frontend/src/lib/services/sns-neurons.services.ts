import type { Principal } from "@dfinity/principal";
import { querySnsNeurons } from "../api/sns.api";
import { snsNeuronsStore } from "../stores/snsNeurons.store";

// TODO: Implement with update and query and error handling https://dfinity.atlassian.net/browse/L2-869
export const loadSnsNeurons = async (
  rootCanisterId: Principal
): Promise<void> => {
  const snsNeurons = await querySnsNeurons();
  snsNeuronsStore.setNeurons({
    rootCanisterId,
    neurons: snsNeurons,
    certified: true,
  });
};
