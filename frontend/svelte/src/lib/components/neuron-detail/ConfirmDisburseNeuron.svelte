<script lang="ts">
  import { ICP, type NeuronInfo } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { i18n } from "../../stores/i18n";
  import { neuronStake } from "../../utils/neuron.utils";
  import TransactionInfo from "../accounts/TransactionInfo.svelte";
  import IcpComponent from "../ic/ICP.svelte";

  export let neuron: NeuronInfo;
  export let destinationAddress: string;

  const dispatcher = createEventDispatcher();
  const executeTransaction = () => {
    // TODO: https://dfinity.atlassian.net/browse/L2-432
    // TODO: Redirect to `/neurons` if success
    dispatcher("nnsClose");
  };
</script>

<form
  on:submit|preventDefault={executeTransaction}
  class="wizard-wrapper"
  data-tid="confirm-disburse-screen"
>
  <div class="amount">
    <IcpComponent inline={true} icp={ICP.fromE8s(neuronStake(neuron))} />
  </div>

  <TransactionInfo
    source={neuron.neuronId.toString()}
    destination={destinationAddress}
  />

  <button class="primary full-width" type="submit">
    {$i18n.accounts.confirm_and_send}
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
