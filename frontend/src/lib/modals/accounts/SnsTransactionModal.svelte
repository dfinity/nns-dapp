<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { NewTransaction } from "$lib/types/transaction";
  import TransactionModal from "./NewTransaction/TransactionModal.svelte";
  import { snsTokenSymbolSelectedStore } from "$lib/derived/sns/sns-token-symbol-selected.store";
  import { snsSelectedTransactionFeeStore } from "$lib/derived/sns/sns-selected-transaction-fee.store";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { snsTransferTokens } from "$lib/services/sns-accounts.services";
  import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";
  import { numberToE8s } from "$lib/utils/token.utils";
  import type { Account } from "$lib/types/account";
  import type { WizardStep } from "@dfinity/gix-components";

  export let selectedAccount: Account | undefined = undefined;

  let currentStep: WizardStep;

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

    const { success } = await snsTransferTokens({
      source: sourceAccount,
      destinationAddress,
      e8s: numberToE8s(amount),
      rootCanisterId: $snsProjectSelectedStore,
    });

    stopBusy("accounts");

    if (success) {
      toastsSuccess({ labelKey: "accounts.transaction_success" });
      dispatcher("nnsClose");
    }
  };
</script>

<TransactionModal
  rootCanisterId={$snsProjectSelectedStore}
  on:nnsSubmit={transfer}
  on:nnsClose
  bind:currentStep
  token={$snsTokenSymbolSelectedStore}
  transactionFee={$snsSelectedTransactionFeeStore}
  sourceAccount={selectedAccount}
>
  <svelte:fragment slot="title"
    >{title ?? $i18n.accounts.new_transaction}</svelte:fragment
  >
  <p slot="description" class="value">
    {replacePlaceholders($i18n.accounts.sns_transaction_description, {
      $token: $snsTokenSymbolSelectedStore?.symbol ?? "",
    })}
  </p>
</TransactionModal>
