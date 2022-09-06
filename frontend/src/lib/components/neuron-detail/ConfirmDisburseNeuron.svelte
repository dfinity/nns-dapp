<script lang="ts">
  import { ICP, TokenAmount, type NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { AppPath } from "../../constants/routes.constants";
  import { startBusyNeuron } from "../../services/busy.services";
  import { disburse } from "../../services/neurons.services";
  import { stopBusy } from "../../stores/busy.store";
  import { i18n } from "../../stores/i18n";
  import { routeStore } from "../../stores/route.store";
  import { toastsStore } from "../../stores/toasts.store";
  import { neuronStake } from "../../utils/neuron.utils";
  import TransactionInfo from "../accounts/TransactionInfo.svelte";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import Spinner from "../ui/Spinner.svelte";

  export let neuron: NeuronInfo;
  export let destinationAddress: string;

  let loading: boolean = false;

  const dispatcher = createEventDispatcher();
  const executeTransaction = async () => {
    startBusyNeuron({
      initiator: "disburse-neuron",
      neuronId: neuron.neuronId,
    });
    loading = true;
    const { success } = await disburse({
      neuronId: neuron.neuronId,
      toAccountId: destinationAddress,
    });
    loading = false;
    stopBusy("disburse-neuron");
    if (success) {
      toastsStore.success({
        labelKey: "neuron_detail.disburse_success",
      });
      routeStore.replace({
        path: AppPath.Neurons,
      });
    }
    dispatcher("nnsClose");
  };
</script>

<form
  on:submit|preventDefault={executeTransaction}
  class="wizard-wrapper"
  data-tid="confirm-disburse-screen"
>
  <div class="amount">
    <AmountDisplay
      inline
      amount={TokenAmount.fromE8s({ amount: neuronStake(neuron) })}
    />
  </div>

  <TransactionInfo
    source={neuron.neuronId.toString()}
    destination={destinationAddress}
  />

  <button
    class="primary full-width"
    type="submit"
    data-tid="disburse-neuron-button"
  >
    {#if loading}
      <Spinner />
    {:else}
      {$i18n.accounts.confirm_and_send}
    {/if}
  </button>
</form>

<style lang="scss">
  @use "../../themes/mixins/modal";

  .amount {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    flex-grow: 1;

    --icp-font-size: var(--font-size-huge);

    @include modal.header;
  }

  button {
    margin: var(--padding) 0 0;
  }
</style>
