<script lang="ts">
  import CurrentBalance from "../../components/accounts/CurrentBalance.svelte";
  import Modal from "../Modal.svelte";
  import { ICP, type NeuronInfo } from "@dfinity/nns";
  import { isValidInputAmount, neuronStake } from "../../utils/neuron.utils";
  import AmountInput from "../../components/ui/AmountInput.svelte";
  import { E8S_PER_ICP } from "../../constants/icp.constants";
  import { i18n } from "../../stores/i18n";
  import { formattedTransactionFeeICP } from "../../utils/icp.utils";
  import { busy, startBusy, stopBusy } from "../../stores/busy.store";
  import { createEventDispatcher } from "svelte";
  import { splitNeuron } from "../../services/neurons.services";
  import { toastsStore } from "../../stores/toasts.store";
  import { mainTransactionFeeNumberStore } from "../../stores/transaction-fees.store";

  export let neuron: NeuronInfo;

  let amount: number | undefined;

  let stakeE8s: bigint;
  $: stakeE8s = neuronStake(neuron);

  let balance: ICP;
  $: balance = ICP.fromE8s(stakeE8s);

  let max: number = 0;
  $: max =
    stakeE8s === BigInt(0)
      ? 0
      : (Number(stakeE8s) - $mainTransactionFeeNumberStore) / E8S_PER_ICP;

  let validForm: boolean;
  $: validForm = isValidInputAmount({ amount, max });

  const onMax = () => (amount = max);

  const dispatcher = createEventDispatcher();
  const split = async () => {
    // TS is not smart enought to understand that `validForm` also covers `amount === undefined`
    if (!validForm || amount === undefined) {
      toastsStore.error({
        labelKey: "error.amount_not_valid",
      });
      return;
    }
    startBusy({ initiator: "split-neuron" });

    const id = await splitNeuron({
      neuronId: neuron.neuronId,
      amount,
    });
    if (id !== undefined) {
      toastsStore.success({
        labelKey: "neuron_detail.split_neuron_success",
      });
    }
    dispatcher("nnsClose");
    stopBusy("split-neuron");
  };
</script>

<Modal on:nnsClose theme="dark" size="big">
  <span slot="title">{$i18n.neuron_detail.split_neuron}</span>
  <section data-tid="split-neuron-modal">
    <CurrentBalance {balance} />

    <AmountInput bind:amount on:nnsMax={onMax} {max} />

    <div>
      <h5>{$i18n.neurons.transaction_fee}</h5>

      <p>{formattedTransactionFeeICP($mainTransactionFeeNumberStore)} ICP</p>
    </div>

    <button
      data-tid="split-neuron-button"
      class="primary full-width"
      on:click={split}
      disabled={!validForm || $busy}
    >
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
