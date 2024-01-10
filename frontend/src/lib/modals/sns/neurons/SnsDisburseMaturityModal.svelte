<script lang="ts">
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { createEventDispatcher } from "svelte";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { SnsNeuron, SnsNeuronId } from "@dfinity/sns";
  import type { Principal } from "@dfinity/principal";
  import { disburseMaturity as disburseMaturityService } from "$lib/services/sns-neurons.services";
  import { minimumAmountToDisburseMaturity } from "$lib/utils/sns-neuron.utils";
  import DisburseMaturityModal from "$lib/modals/neurons/DisburseMaturityModal.svelte";
  import { tokensStore } from "$lib/stores/tokens.store";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";

  export let neuron: SnsNeuron;
  export let neuronId: SnsNeuronId;
  export let rootCanisterId: Principal;
  export let reloadNeuron: () => Promise<void>;

  let token: IcrcTokenMetadata;
  // Modal can't appear without the token being loaded.
  $: token = $tokensStore[rootCanisterId.toText()]?.token as IcrcTokenMetadata;

  let minimumAmountE8s: bigint;
  // Token is loaded with all the projects from the aggregator.
  // Therefore, if the user made it here, it's present.
  $: minimumAmountE8s = minimumAmountToDisburseMaturity(token?.fee ?? 0n);

  const dispatcher = createEventDispatcher();
  const close = () => dispatcher("nnsClose");

  const disburseMaturity = async ({
    detail: { percentageToDisburse, destinationAddress },
  }: CustomEvent<{
    percentageToDisburse: number;
    destinationAddress: string;
  }>) => {
    startBusy({ initiator: "disburse-maturity" });

    const { success } = await disburseMaturityService({
      neuronId,
      percentageToDisburse,
      rootCanisterId,
      toAccountAddress: destinationAddress,
    });

    await reloadNeuron();

    if (success) {
      toastsSuccess({
        labelKey: "neuron_detail.disburse_maturity_success",
      });
      close();
    }

    stopBusy("disburse-maturity");
  };
</script>

<DisburseMaturityModal
  availableMaturityE8s={neuron.maturity_e8s_equivalent}
  {minimumAmountE8s}
  on:nnsDisburseMaturity={disburseMaturity}
  {rootCanisterId}
  {token}
  on:nnsClose
/>
