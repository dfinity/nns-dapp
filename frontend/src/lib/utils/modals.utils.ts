import type {
  NnsNeuronModal,
  NnsNeuronModalData,
} from "$lib/types/nns-neuron-detail.modal";
import type { SnsNeuronModal } from "$lib/types/sns-neuron-detail.modal";
import { emit } from "$lib/utils/events.utils";

export const openNnsNeuronModal = <D extends NnsNeuronModalData>(
  detail: NnsNeuronModal<D>
) =>
  emit<NnsNeuronModal<D>>({
    message: "nnsNeuronDetailModal",
    detail,
  });

export const openSnsNeuronModal = (detail: SnsNeuronModal) =>
  emit<SnsNeuronModal>({
    message: "snsNeuronDetailModal",
    detail,
  });
