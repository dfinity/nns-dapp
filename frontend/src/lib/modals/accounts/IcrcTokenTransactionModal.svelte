<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import { startBusy, stopBusy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import { toastsSuccess } from "$lib/stores/toasts.store";
  import type { NewTransaction } from "$lib/types/transaction";
  import TransactionModal from "$lib/modals/transaction/TransactionModal.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import type { Account } from "$lib/types/account";
  import type { WizardStep } from "@dfinity/gix-components";
  import type { TransactionInit } from "$lib/types/transaction";
  import { TokenAmount, nonNullish } from "@dfinity/utils";
  import type { Principal } from "@dfinity/principal";
  import { icrcTransferTokens } from "$lib/services/icrc-accounts.services";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";

  // TODO: Refactor to expect as props the rootCanisterId, transactionFee and token.
  // This way we can reuse this component in a dashboard page.
  export let selectedAccount: Account | undefined = undefined;
  export let ledgerCanisterId: Principal;
  export let token: IcrcTokenMetadata;
  export let transactionFee: TokenAmount;
  export let reloadSourceAccount: (() => void) | undefined = undefined;

  let transactionInit: TransactionInit = {
    sourceAccount: selectedAccount,
  };

  let currentStep: WizardStep | undefined;

  $: title =
    currentStep?.name === "Form"
      ? $i18n.accounts.send
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

    const { blockIndex } = await icrcTransferTokens({
      source: sourceAccount,
      destinationAddress,
      amount,
      ledgerCanisterId,
      fee: token.fee,
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
  rootCanisterId={ledgerCanisterId}
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
