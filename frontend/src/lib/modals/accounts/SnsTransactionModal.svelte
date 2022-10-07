<script lang="ts">
  import { ICPToken, TokenAmount } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import type { Step } from "$lib/stores/steps.state";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { NewTransaction } from "$lib/types/transaction.context";
  import TransactionModal from "./NewTransaction/TransactionModal.svelte";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";

  let currentStep: Step;

  $: title =
    currentStep?.name === "Form"
      ? $i18n.accounts.new_transaction
      : $i18n.accounts.review_transaction;

  const dispatcher = createEventDispatcher();
  const transfer = async ({
    detail: { sourceAccount, amount, destinationAddress },
  }: CustomEvent<NewTransaction>) => {
    startBusy({
      initiator: "accounts",
    });

    // Errors in amount already handled by TransactionModal
    const tokenAmount = TokenAmount.fromNumber({
      amount,
      token: ICPToken,
    });

    console.log("transfer", sourceAccount, destinationAddress, tokenAmount);

    // if (success) {
    //   toastsSuccess({ labelKey: "accounts.transaction_success" });
    // }

    stopBusy("accounts");

    // // We close the modal in case of success or error if the selected source is not a hardware wallet.
    // // In case of hardware wallet, the error messages might contain interesting information for the user such as "your device is idle"
    // if (success || !isAccountHardwareWallet(sourceAccount)) {
    //   dispatcher("nnsClose");
    // }
  };
</script>

<TransactionModal
  on:nnsSubmit={transfer}
  on:nnsClose
  bind:currentStep
  token={$snsTokenSymbolSelectedStore}
  transactionFee={$snsSelectedTransactionFeeStore}
>
  <svelte:fragment slot="title"
    >{title ?? $i18n.accounts.new_transaction}</svelte:fragment
  >
  <p slot="description">
    {replacePlaceholders($i18n.accounts.sns_transaction_description, {
      $token: $snsTokenSymbolSelectedStore?.symbol ?? "",
    })}
  </p>
</TransactionModal>
