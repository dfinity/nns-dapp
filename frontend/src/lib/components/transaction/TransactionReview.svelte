<script lang="ts">
  import type { TokenAmount, Token } from "@dfinity/utils";
  import { createEventDispatcher } from "svelte";
  import { busy } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import type { NewTransaction } from "$lib/types/transaction";
  import TransactionSource from "$lib/components/transaction/TransactionSource.svelte";
  import SignInGuard from "$lib/components/common/SignInGuard.svelte";
  import type { TransactionNetwork } from "$lib/types/transaction";
  import TransactionSummary from "$lib/components/transaction/TransactionSummary.svelte";
  import TransactionDescription from "$lib/components/transaction/TransactionDescription.svelte";

  export let transaction: NewTransaction;
  export let disableSubmit: boolean;
  export let transactionFee: TokenAmount;
  export let token: Token;
  export let selectedNetwork: TransactionNetwork | undefined = undefined;
  export let showLedgerFee = true;

  let sourceAccount: Account;
  let amount: number;
  let destinationAddress: string;
  $: ({ sourceAccount, amount, destinationAddress } = transaction);

  const dispatcher = createEventDispatcher();
  const submit = () => {
    dispatcher("nnsSubmit", transaction);
  };

  const back = () => {
    dispatcher("nnsBack");
  };
</script>

<div data-tid="transaction-step-2">
  <div class="info">
    <TransactionSource account={sourceAccount} {token} />

    <TransactionSummary {amount} {token} {transactionFee} {showLedgerFee}>
      <slot name="received-amount" slot="received-amount" />
    </TransactionSummary>

    <TransactionDescription {selectedNetwork} {destinationAddress}>
      <slot name="description" slot="description" />
      <slot name="destination-info" slot="destination-info" />
    </TransactionDescription>

    <slot name="additional-info" />
  </div>

  <div class="toolbar">
    <button class="secondary" data-tid="transaction-button-back" on:click={back}
      >{$i18n.accounts.edit_transaction}</button
    >
    <SignInGuard>
      <button
        class="primary"
        data-tid="transaction-button-execute"
        disabled={$busy || disableSubmit}
        on:click={submit}>{$i18n.accounts.send_now}</button
      >
    </SignInGuard>
  </div>
</div>

<style lang="scss">
  .info {
    display: flex;
    flex-direction: column;
    gap: var(--padding-0_5x);
  }

  .toolbar {
    margin: var(--padding-2x) 0 0;
  }
</style>
