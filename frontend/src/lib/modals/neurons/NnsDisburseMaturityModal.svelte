<script lang="ts">
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { MIN_DISBURSEMENT_WITH_VARIANCE } from "$lib/constants/neurons.constants";
  import DisburseMaturityModal from "$lib/modals/neurons/DisburseMaturityModal.svelte";
  import { analytics } from "$lib/services/analytics.services";
  import { disburseMaturity as disburseMaturityService } from "$lib/services/neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { NeuronInfo } from "@dfinity/nns";
  import { ICPToken } from "@dfinity/utils";

  type Props = {
    neuron: NeuronInfo;
    close: () => void;
  };

  const { neuron, close }: Props = $props();
  const disburseMaturity = async ({
    detail: { percentageToDisburse, destinationAddress: toAccountIdentifier },
  }: CustomEvent<{
    percentageToDisburse: number;
    destinationAddress: string;
  }>) => {
    startBusy({ initiator: "disburse-maturity" });

    analytics.event("disburse-nns-maturity-confirmation-click", {
      percentage: percentageToDisburse,
    });

    const { success } = await disburseMaturityService({
      neuronId: neuron.neuronId,
      percentageToDisburse,
      toAccountIdentifier,
    });

    stopBusy("disburse-maturity");

    if (success) {
      toastsSuccess({
        labelKey: "neuron_detail.disburse_maturity_success",
      });
      close();
    }
  };

  const availableMaturityE8s = $derived(
    neuron.fullNeuron?.maturityE8sEquivalent ?? 0n
  );
</script>

<DisburseMaturityModal
  {availableMaturityE8s}
  minimumAmountE8s={MIN_DISBURSEMENT_WITH_VARIANCE}
  on:nnsDisburseMaturity={disburseMaturity}
  rootCanisterId={OWN_CANISTER_ID}
  token={ICPToken}
  on:nnsClose={close}
/>
