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
  import type { Token } from "@dfinity/utils";
  import { selectedUniverseIdStore } from "$lib/derived/selected-universe.derived";
  import { decodeIcrcAccount } from "@dfinity/ledger";

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

  let token: Token | undefined;
  $: token = $tokensStore[$selectedUniverseIdStore.toText()]?.token;

  const dispatcher = createEventDispatcher();
  const close = () => dispatcher("nnsClose");

  const disburseMaturity = async ({
    detail: { percentage, destinationAddress },
  }: CustomEvent<{
    percentage: number;
    destinationAddress: string;
  }>) => {
    startBusy({ initiator: "disburse-maturity" });

    const toAccount = decodeIcrcAccount(destinationAddress);
    const { success } = await disburseMaturityService({
      rootCanisterId,
      neuronId,
      percentageToDisburse: percentage,
      toAccount,
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
  {rootCanisterId}
  formattedMaturity={maturity}
  tokenSymbol={token?.symbol ?? ""}
  on:nnsDisburseMaturity={disburseMaturity}
  on:nnsClose
/>
