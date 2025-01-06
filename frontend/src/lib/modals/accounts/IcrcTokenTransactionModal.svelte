<script lang="ts">
  import TransactionModal from "$lib/modals/transaction/TransactionModal.svelte";
  import { transferTokens } from "$lib/services/icrc-accounts.services";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { Account } from "$lib/types/account";
  import type { NewTransaction, TransactionInit } from "$lib/types/transaction";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { numberToUlps } from "$lib/utils/token.utils";
  import type { WizardStep } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { TokenAmountV2, nonNullish, type Token } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";

  export let selectedAccount: Account | undefined = undefined;
  export let ledgerCanisterId: Principal;
  export let universeId: Principal;
  export let token: Token;
  export let transactionFee: TokenAmountV2;
  export let reloadSourceAccount: (() => void) | undefined = undefined;

  let transactionInit: TransactionInit = {
    sourceAccount: selectedAccount,
  };

  let currentStep: WizardStep | undefined;

  $: title =
    currentStep?.name === "Form"
      ? replacePlaceholders($i18n.core.send_with_token, {
          $token: token.symbol,
        })
      : currentStep?.name === "QRCode"
        ? $i18n.accounts.scan_qr_code
        : $i18n.accounts.you_are_sending;

  const dispatcher = createEventDispatcher();
  const transfer = async ({
    detail: { sourceAccount, amount, destinationAddress },
  }: CustomEvent<NewTransaction>) => {
    startBusy({
      initiator: "accounts",
    });

    const { blockIndex } = await transferTokens({
      source: sourceAccount,
      destinationAddress,
      amountUlps: numberToUlps({ amount, token }),
      ledgerCanisterId,
      fee: transactionFee.toUlps(),
    });

    stopBusy("accounts");

    if (nonNullish(blockIndex)) {
      reloadSourceAccount?.();
      toastsSuccess({ labelKey: "accounts.transaction_success" });
      dispatcher("nnsClose");
    }
  };
</script>

<TransactionModal
  testId="icrc-token-transaction-modal-component"
  rootCanisterId={universeId}
  on:nnsSubmit={transfer}
  on:nnsClose
  bind:currentStep
  {token}
  {transactionFee}
  {transactionInit}
>
  <svelte:fragment slot="title">{title ?? $i18n.accounts.send}</svelte:fragment>
  <p slot="description" class="value no-margin">
    {replacePlaceholders($i18n.accounts.sns_transaction_description, {
      $token: token.symbol,
    })}
  </p>
</TransactionModal>
