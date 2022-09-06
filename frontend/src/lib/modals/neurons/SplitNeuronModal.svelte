<script lang="ts">
  import CurrentBalance from "../../components/accounts/CurrentBalance.svelte";
  import Modal from "../Modal.svelte";
  import { ICP, TokenAmount, type NeuronInfo } from "@dfinity/nns";
  import { isValidInputAmount, neuronStake } from "../../utils/neuron.utils";
  import AmountInput from "../../components/ui/AmountInput.svelte";
  import { E8S_PER_ICP } from "../../constants/icp.constants";
  import { i18n } from "../../stores/i18n";
  import { formattedTransactionFeeICP } from "../../utils/icp.utils";
  import { busy, startBusy, stopBusy } from "../../stores/busy.store";
  import { createEventDispatcher } from "svelte";
  import { splitNeuron } from "../../services/neurons.services";
  import { toastsStore } from "../../stores/toasts.store";
  import { mainTransactionFeeStore } from "../../stores/transaction-fees.store";
  import FooterModal from "../FooterModal.svelte";
  import Value from "../../components/ui/Value.svelte";

  export let neuron: NeuronInfo;

  let amount: number | undefined;

  let stakeE8s: bigint;
  $: stakeE8s = neuronStake(neuron);

  let balance: TokenAmount;
  $: balance = TokenAmount.fromE8s({ amount: stakeE8s });

  let max: number = 0;
  $: max =
    stakeE8s === BigInt(0)
      ? 0
      : (Number(stakeE8s) - $mainTransactionFeeStore) / E8S_PER_ICP;

  let validForm: boolean;
  $: validForm = isValidInputAmount({ amount, max });

  const onMax = () => (amount = max);

  const dispatcher = createEventDispatcher();
  const close = () => dispatcher("nnsClose");
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
    close();
    stopBusy("split-neuron");
  };
</script>

<Modal on:nnsClose size="big">
  <span slot="title">{$i18n.neuron_detail.split_neuron}</span>
  <section data-tid="split-neuron-modal">
    <CurrentBalance {balance} />

    <AmountInput bind:amount on:nnsMax={onMax} {max} />

    <div>
      <h5>{$i18n.neurons.transaction_fee}</h5>

      <p>
        <Value>{formattedTransactionFeeICP($mainTransactionFeeStore)}</Value> ICP
      </p>
    </div>

    <FooterModal>
      <button class="secondary small" on:click={close}>
        {$i18n.core.cancel}
      </button>
      <button
        data-tid="split-neuron-button"
        class="primary small"
        on:click={split}
        disabled={!validForm || $busy}
      >
        {$i18n.neuron_detail.split_neuron_confirm}
      </button>
    </FooterModal>
  </section>
</Modal>

<style lang="scss">
  @use "../../themes/mixins/modal";

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
