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
  import { ckBTCTransferTokens } from "$lib/services/ckbtc-accounts.services";
  import type { TokenAmount } from "@dfinity/nns";
  import type { IcrcTokenMetadata } from "$lib/types/icrc";
  import type { TransactionNetwork } from "$lib/types/transaction";
  import type { UniverseCanisterId } from "$lib/types/universe";
  import { isUniverseCkTESTBTC } from "$lib/utils/universe.utils";

  export let selectedAccount: Account | undefined = undefined;
  export let loadTransactions = false;

  let universeId: UniverseCanisterId;
  export let token: IcrcTokenMetadata;
  export let transactionFee: TokenAmount;

  let selectedNetwork: TransactionNetwork | undefined = undefined;

  let currentStep: WizardStep;

  let title: string;
  $: title =
    currentStep?.name === "Form"
      ? $i18n.accounts.send
      : $i18n.accounts.you_are_sending;

  const dispatcher = createEventDispatcher();
  const transfer = async ({
    detail: { sourceAccount, amount, destinationAddress },
  }: CustomEvent<NewTransaction>) => {
    startBusy({
      initiator: "accounts",
    });

    // TODO: if selectedNetwork === bitcoin then convertCkBTCToBtc
    // else ckBTCTransferTokens

    const { success } = await ckBTCTransferTokens({
      source: sourceAccount,
      destinationAddress,
      amount,
      loadTransactions,
      universeId,
    });

    stopBusy("accounts");

    if (success) {
      toastsSuccess({ labelKey: "accounts.transaction_success" });
      dispatcher("nnsTransfer");
    }
  };

  // TODO(GIX-1330): display bitcoin transaction fee
</script>

<TransactionModal
  rootCanisterId={universeId}
  on:nnsSubmit={transfer}
  on:nnsClose
  bind:currentStep
  {token}
  {transactionFee}
  sourceAccount={selectedAccount}
  mustSelectNetwork={isUniverseCkTESTBTC(universeId)}
  bind:selectedNetwork
>
  <svelte:fragment slot="title">{title ?? $i18n.accounts.send}</svelte:fragment>
  <p slot="description" class="value">
    {replacePlaceholders($i18n.accounts.ckbtc_transaction_description, {
      $token: token.symbol,
    })}
  </p>
</TransactionModal>
