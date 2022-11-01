<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { transferICP } from "$lib/services/accounts.services";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { Account } from "$lib/types/account";
  import type { NewTransaction } from "$lib/types/transaction";
  import { isAccountHardwareWallet } from "$lib/utils/accounts.utils";
  import TransactionModal from "./NewTransaction/TransactionModal.svelte";
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import {
    stopBusy,
    startBusy,
    type WizardStep,
  } from "@dfinity/gix-components";
  import { mainTransactionFeeStoreAsToken } from "$lib/derived/main-transaction-fee.derived";

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
      ...(isAccountHardwareWallet(sourceAccount) && {
        labelKey: "busy_screen.pending_approval_hw",
      }),
    });

    const { success } = await transferICP({
      sourceAccount,
      destinationAddress,
      amount,
    });

    if (success) {
      toastsSuccess({ labelKey: "accounts.transaction_success" });
    }

    stopBusy("accounts");

    // We close the modal in case of success or error if the selected source is not a hardware wallet.
    // In case of hardware wallet, the error messages might contain interesting information for the user such as "your device is idle"
    if (success || !isAccountHardwareWallet(sourceAccount)) {
      dispatcher("nnsClose");
    }
  };
</script>

<TransactionModal
  rootCanisterId={OWN_CANISTER_ID}
  on:nnsSubmit={transfer}
  on:nnsClose
  bind:currentStep
  sourceAccount={selectedAccount}
  transactionFee={$mainTransactionFeeStoreAsToken}
>
  <svelte:fragment slot="title"
    >{title ?? $i18n.accounts.new_transaction}</svelte:fragment
  >
  <p slot="description" class="value">
    {$i18n.accounts.icp_transaction_description}
  </p>
</TransactionModal>
