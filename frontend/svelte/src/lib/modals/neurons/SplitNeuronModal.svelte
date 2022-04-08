<script lang="ts">
  import CurrentBalance from "../../components/accounts/CurrentBalance.svelte";
  import Modal from "../Modal.svelte";
  import { ICP, type NeuronInfo } from "@dfinity/nns";
  import { neuronStake } from "../../utils/neuron.utils";
  import AmountInput from "../../components/ui/AmountInput.svelte";
  import {
    E8S_PER_ICP,
    TRANSACTION_FEE_E8S,
  } from "../../constants/icp.constants";
  import { i18n } from "../../stores/i18n";
  import { formattedTransactionFeeICP } from "../../utils/icp.utils";

  export let neuron: NeuronInfo;

  let amount: number | undefined;

  let stakeE8s: bigint;
  $: stakeE8s = neuronStake(neuron);

  let balance: ICP;
  $: balance = ICP.fromE8s(stakeE8s);

  let max: number = 0;
  $: max = (Number(stakeE8s) - TRANSACTION_FEE_E8S) / E8S_PER_ICP;

  let validForm: boolean;
  $: validForm = amount !== undefined && amount > 0 && amount <= max;

  const onMax = () => (amount = max);

  const split = () => {
    console.log("splitting neuron...");
  };
</script>

<Modal on:nnsClose theme="dark" size="medium">
  <span slot="title">{$i18n.neuron_detail.split_neuron}</span>
  <section>
    <CurrentBalance {balance} />

    <AmountInput bind:amount on:nnsMax={onMax} {max} />

    <div>
      <h5>{$i18n.neurons.transaction_fee}</h5>

      <p>{formattedTransactionFeeICP()} ICP</p>
    </div>

    <button class="primary full-width" on:click={split} disabled={!validForm}>
      {$i18n.neuron_detail.split_neuron_confirm}
    </button>
  </section>
</Modal>

<style lang="scss">
  @use "../../themes/mixins/modal.scss";

  section {
    @include modal.section;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: space-between;
    gap: var(--padding);
    margin-top: calc(4 * var(--padding));
  }
</style>
