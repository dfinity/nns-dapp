<script lang="ts">
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import {
    MATURITY_MODULATION_VARIANCE_PERCENTAGE,
    MINIMUM_DISBURSEMENT,
  } from "$lib/constants/neurons.constants";
  import DisburseMaturityModal from "$lib/modals/neurons/DisburseMaturityModal.svelte";
  import { disburseMaturity as disburseMaturityService } from "$lib/services/neurons.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { NeuronId, NeuronInfo } from "@dfinity/nns";
  import { ICPToken } from "@dfinity/utils";

  type Props = {
    neuron: NeuronInfo;
    neuronId: NeuronId;
    close: () => void;
  };

  const { neuron, neuronId, close }: Props = $props();
  const minimumAmountE8s = BigInt(
    Math.round(
      Number(MINIMUM_DISBURSEMENT) / MATURITY_MODULATION_VARIANCE_PERCENTAGE
    )
  );
  const disburseMaturity = async ({
    detail: { percentageToDisburse },
  }: CustomEvent<{
    percentageToDisburse: number;
    destinationAddress: string;
  }>) => {
    startBusy({ initiator: "disburse-maturity" });

    // TODO(disburse-maturity): switch to account identifier when API supports it
    const { success } = await disburseMaturityService({
      neuronId,
      percentageToDisburse,
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
  {minimumAmountE8s}
  on:nnsDisburseMaturity={disburseMaturity}
  rootCanisterId={OWN_CANISTER_ID}
  token={ICPToken}
  on:nnsClose={close}
/>
