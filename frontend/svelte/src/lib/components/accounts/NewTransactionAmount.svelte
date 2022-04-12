<script lang="ts">
  import { getContext } from "svelte";
  import { i18n } from "../../stores/i18n";
  import type { TransactionContext } from "../../stores/transaction.store";
  import { NEW_TRANSACTION_CONTEXT_KEY } from "../../stores/transaction.store";
  import CurrentBalance from "./CurrentBalance.svelte";
  import AmountInput from "../ui/AmountInput.svelte";
  import { E8S_PER_ICP } from "../../constants/icp.constants";
  import { toastsStore } from "../../stores/toasts.store";
  import NewTransactionInfo from "./NewTransactionInfo.svelte";
  import { ICP } from "@dfinity/nns";
  import type { FromICPStringError } from "@dfinity/nns";
  import { maxICP } from "../../utils/icp.utils";

  const context: TransactionContext = getContext<TransactionContext>(
    NEW_TRANSACTION_CONTEXT_KEY
  );
  const { store }: TransactionContext = context;

  let amount: number | undefined = $store.amount
    ? Number($store.amount.toE8s()) / E8S_PER_ICP
    : undefined;

  let max: number = 0;
  $: max = maxICP($store.selectedAccount?.balance);

  let validForm: boolean;
  $: validForm = amount !== undefined && amount > 0 && amount <= max;

  const onMax = () => (amount = max);
  const onSubmit = () => {
    if (!validForm) {
      toastsStore.error({
        labelKey: "error.transaction_invalid_amount",
      });
      return;
    }

    const icp: ICP | FromICPStringError = ICP.fromString(`${amount}`);

    if (!(icp instanceof ICP)) {
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
    <CurrentBalance account={$store.selectedAccount} />

    <AmountInput bind:amount on:nnsMax={onMax} {max} />
  </div>

  <NewTransactionInfo />

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
