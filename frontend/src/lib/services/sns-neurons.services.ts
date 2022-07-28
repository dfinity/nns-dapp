import { querySnsNeurons } from "../api/sns.api";
import { snsNeuronsStore } from "../stores/snsNeurons.store";

export const loadSnsNeurons = async (): Promise<void> => {
  const snsNeurons = await querySnsNeurons();
  snsNeuronsStore.setNeurons({
    neurons: snsNeurons,
    certified: true,
  });
};
