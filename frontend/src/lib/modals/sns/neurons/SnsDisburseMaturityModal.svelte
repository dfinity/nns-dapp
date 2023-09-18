<script lang="ts">
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { createEventDispatcher } from "svelte";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { SnsNeuron, SnsNeuronId } from "@dfinity/sns";
  import type { Principal } from "@dfinity/principal";
  import { disburseMaturity as disburseMaturityService } from "$lib/services/sns-neurons.services";
  import { formattedMaturity } from "$lib/utils/sns-neuron.utils";
  import DisburseMaturityModal from "$lib/modals/neurons/DisburseMaturityModal.svelte";
  import { snsProjectMainAccountStore } from "$lib/derived/sns/sns-project-accounts.derived";
  import { shortenWithMiddleEllipsis } from "$lib/utils/format.utils";
  import { tokensStore } from "$lib/stores/tokens.store";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";

  export let neuron: SnsNeuron;
  export let neuronId: SnsNeuronId;
  export let rootCanisterId: Principal;
  export let reloadNeuron: () => Promise<void>;

  let maturity: string;
  $: maturity = formattedMaturity(neuron);

  let destinationAddress: string;
  $: destinationAddress = shortenWithMiddleEllipsis(
    $snsProjectMainAccountStore?.identifier ?? ""
  );

  let token: IcrcTokenMetadata | undefined;
  $: token = $tokensStore[rootCanisterId.toText()]?.token;

  // 99% of users will disburse more than the transaction fee.
  // We don't want a possible error fetching the fee to disrupt the whole flow.
  let minimumAmountE8s = 0n;
  $: minimumAmountE8s = token?.fee ?? 0n;

  const dispatcher = createEventDispatcher();
  const close = () => dispatcher("nnsClose");

  const disburseMaturity = async ({
    detail: { percentageToDisburse },
  }: CustomEvent<{ percentageToDisburse: number }>) => {
    startBusy({ initiator: "disburse-maturity" });

    const { success } = await disburseMaturityService({
      neuronId,
      percentageToDisburse,
      rootCanisterId,
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
  tokenSymbol={token?.symbol ?? ""}
  on:nnsDisburseMaturity={disburseMaturity}
  on:nnsClose
/>
