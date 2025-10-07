<script lang="ts">
  import { OWN_CANISTER_ID } from "$lib/constants/canister-ids.constants";
  import { mainTransactionFeeStoreAsToken } from "$lib/derived/main-transaction-fee.derived";
  import TransactionModal from "$lib/modals/transaction/TransactionModal.svelte";
  import { transferICP } from "$lib/services/icp-accounts.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import { transactionMemoOptionStore } from "$lib/stores/transaction-memo-option.store";
  import type { Account } from "$lib/types/account";
  import type { NewTransaction, TransactionInit } from "$lib/types/transaction";
  import { isAccountHardwareWallet } from "$lib/utils/accounts.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import type { WizardStep } from "@dfinity/gix-components";
  import { ICPToken } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  export let selectedAccount: Account | undefined = undefined;

  let transactionInit: TransactionInit = {
    sourceAccount: selectedAccount,
  };

  let currentStep: WizardStep | undefined;

  $: title =
    currentStep?.name === "Form"
      ? replacePlaceholders($i18n.core.send_with_token, {
          $token: ICPToken.symbol,
        })
      : currentStep?.name === "QRCode"
        ? $i18n.accounts.scan_qr_code
        : $i18n.accounts.review_transaction;

  const dispatcher = createEventDispatcher();
  const transfer = async ({
    detail: { sourceAccount, amount, destinationAddress, memo },
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
      memo: $transactionMemoOptionStore === "show" ? memo : undefined,
    });

    if (success) {
      toastsSuccess({ labelKey: "accounts.transaction_success" });
    }

    stopBusy("accounts");

    // We close the modal in case of success or error if the selected source is not a Ledger device.
    // In case of Ledger device, the error messages might contain interesting information for the user such as "your device is idle"
    if (success || !isAccountHardwareWallet(sourceAccount)) {
      dispatcher("nnsClose");
    }
  };
</script>

<TransactionModal
  testId="icp-transaction-modal-component"
  rootCanisterId={OWN_CANISTER_ID}
  on:nnsSubmit={transfer}
  on:nnsClose
  bind:currentStep
  {transactionInit}
  transactionFee={$mainTransactionFeeStoreAsToken}
  withMemo={$transactionMemoOptionStore === "show"}
>
  <svelte:fragment slot="title">{title ?? $i18n.accounts.send}</svelte:fragment>
  <p slot="description" class="value no-margin">
    {$i18n.accounts.icp_transaction_description}
  </p>
</TransactionModal>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .input-label {
    display: inline-block;
    margin-top: var(--padding-2x);
    @include fonts.small();
    color: var(--text-description);
  }
</style>
