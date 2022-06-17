<script lang="ts">
  import { getContext } from "svelte";
  import { i18n } from "../../stores/i18n";
  import type { TransactionContext } from "../../types/transaction.context";
  import { NEW_TRANSACTION_CONTEXT_KEY } from "../../types/transaction.context";
  import CurrentBalance from "./CurrentBalance.svelte";
  import AmountInput from "../ui/AmountInput.svelte";
  import { E8S_PER_ICP } from "../../constants/icp.constants";
  import { toastsStore } from "../../stores/toasts.store";
  import NewTransactionInfo from "./NewTransactionInfo.svelte";
  import { ICP } from "@dfinity/nns";
  import { convertNumberToICP, maxICP } from "../../utils/icp.utils";
  import { isValidInputAmount } from "../../utils/neuron.utils";
  import { mainTransactionFeeNumberStore } from "../../stores/transaction-fees.store";

  const context: TransactionContext = getContext<TransactionContext>(
    NEW_TRANSACTION_CONTEXT_KEY
  );
  const { store }: TransactionContext = context;

  let amount: number | undefined = $store.amount
    ? Number($store.amount.toE8s()) / E8S_PER_ICP
    : undefined;

  let max: number = 0;
  $: max = maxICP({
    icp: $store.selectedAccount?.balance,
    fee: $mainTransactionFeeNumberStore,
  });

  let validForm: boolean;
  $: validForm = isValidInputAmount({ amount, max });

  let balance: ICP;
  $: ({ balance } = $store.selectedAccount ?? {
    balance: ICP.fromE8s(BigInt(0)),
  });

  const onMax = () => (amount = max);
  const onSubmit = () => {
    // TS not smart enough to know that validForm also covers `amount === undefiend`
    if (!validForm || amount === undefined) {
      toastsStore.error({
        labelKey: "error.transaction_invalid_amount",
      });
      return;
    }

    const icp: ICP | undefined = convertNumberToICP(amount);

    if (icp === undefined) {
      toastsStore.error({
        labelKey: "error.amount_not_valid",
      });
      return;
    }

    const { store, next }: TransactionContext = context;

    store.update((data) => ({
      ...data,
      amount: icp,
    }));

    next?.();
  };
</script>

<form on:submit|preventDefault={onSubmit} class="wizard-wrapper">
  <div class="head">
    <CurrentBalance {balance} />

    <AmountInput bind:amount on:nnsMax={onMax} {max} />
  </div>

  <NewTransactionInfo feeOnly={true} />

  <button class="primary full-width" type="submit" disabled={!validForm}>
    {$i18n.accounts.review_transaction}
  </button>
</form>

<style lang="scss">
  @use "../../themes/mixins/modal";

  .head {
    @include modal.header;
  }

  button {
    margin-top: var(--padding);
  }
</style>
