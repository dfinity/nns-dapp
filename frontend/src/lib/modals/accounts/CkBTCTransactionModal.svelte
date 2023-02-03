<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { NewTransaction } from "$lib/types/transaction";
  import TransactionModal from "./NewTransaction/TransactionModal.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import type { Account } from "$lib/types/account";
  import type { WizardStep } from "@dfinity/gix-components";
  import { CKBTC_UNIVERSE_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import {
    ckBTCTokenFeeStore,
    ckBTCTokenStore,
  } from "$lib/derived/universes-tokens.derived";
  import { nonNullish } from "$lib/utils/utils";
  import { ckBTCTransferTokens } from "$lib/services/ckbtc-accounts.services";

  export let selectedAccount: Account | undefined = undefined;
  export let loadTransactions = false;

  let currentStep: WizardStep;

  let title: string;
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

    const { success } = await ckBTCTransferTokens({
      source: sourceAccount,
      destinationAddress,
      amount,
      loadTransactions,
    });

    stopBusy("accounts");

    if (success) {
      toastsSuccess({ labelKey: "accounts.transaction_success" });
      dispatcher("nnsClose");
    }
  };
</script>

<!-- Checks for type safety but, already performs in parent -->
{#if nonNullish($ckBTCTokenStore) && nonNullish($ckBTCTokenFeeStore)}
  <TransactionModal
    rootCanisterId={CKBTC_UNIVERSE_CANISTER_ID}
    on:nnsSubmit={transfer}
    on:nnsClose
    bind:currentStep
    token={$ckBTCTokenStore.token}
    transactionFee={$ckBTCTokenFeeStore}
    sourceAccount={selectedAccount}
  >
    <svelte:fragment slot="title"
      >{title ?? $i18n.accounts.new_transaction}</svelte:fragment
    >
    <p slot="description" class="value">
      {replacePlaceholders($i18n.accounts.sns_transaction_description, {
        $token: $ckBTCTokenStore.token.symbol,
      })}
    </p>
  </TransactionModal>
{/if}
