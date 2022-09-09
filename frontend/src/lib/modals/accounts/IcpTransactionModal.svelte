<script lang="ts">
  import { ICPToken, TokenAmount } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { transferICP } from "../../services/accounts.services";
  import { startBusy, stopBusy } from "../../stores/busy.store";
  import { i18n } from "../../stores/i18n";
  import type { Step } from "../../stores/steps.state";
  import { toastsStore } from "../../stores/toasts.store";
  import type { Account } from "../../types/account";
  import type { NewTransaction } from "../../types/transaction.context";
  import { isAccountHardwareWallet } from "../../utils/accounts.utils";
  import TransactionModal from "./NewTransaction/TransactionModal.svelte";

  export let selectedAccount: Account | undefined = undefined;

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
      ...(isAccountHardwareWallet(sourceAccount) && {
        labelKey: "busy_screen.pending_approval_hw",
      }),
    });

    // Errors in amount already handled by TransactionModal
    const tokenAmount = TokenAmount.fromNumber({
      amount,
      token: ICPToken,
    }) as TokenAmount;

    const { success } = await transferICP({
      selectedAccount: sourceAccount,
      destinationAddress,
      amount: tokenAmount,
    });

    if (success) {
      toastsStore.success({ labelKey: "accounts.transaction_success" });
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
  on:nnsSubmit={transfer}
  on:nnsClose
  bind:currentStep
  sourceAccount={selectedAccount}
>
  <svelte:fragment slot="title"
    >{title ?? $i18n.accounts.new_transaction}</svelte:fragment
  >
  <p slot="description">
    {$i18n.accounts.icp_transaction_description}
  </p>
</TransactionModal>
