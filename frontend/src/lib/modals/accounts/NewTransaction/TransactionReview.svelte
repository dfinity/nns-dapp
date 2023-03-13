<script lang="ts">
  import { TokenAmount, type Token } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { IconSouth, busy } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import type { NewTransaction } from "$lib/types/transaction";
  import TransactionSource from "$lib/modals/accounts/NewTransaction/TransactionSource.svelte";
  import SignInGuard from "$lib/components/common/SignInGuard.svelte";
  import type { TransactionNetwork } from "$lib/types/transaction";
  import { nonNullish } from "@dfinity/utils";
  import { isTransactionNetworkBtc } from "$lib/utils/transactions.utils";

  export let transaction: NewTransaction;
  export let disableSubmit: boolean;
  export let transactionFee: TokenAmount;
  export let token: Token;
  export let selectedNetwork: TransactionNetwork | undefined = undefined;

  let sourceAccount: Account;
  let amount: number;
  let destinationAddress: string;
  $: ({ sourceAccount, amount, destinationAddress } = transaction);

  // If we made it this far, the number is valid.
  let tokenAmount: TokenAmount;
  $: tokenAmount = TokenAmount.fromNumber({
    amount,
    token,
  });

  const dispatcher = createEventDispatcher();
  const submit = () => {
    dispatcher("nnsSubmit", transaction);
  };

  const back = () => {
    dispatcher("nnsBack");
  };

  let networkBtc = false;
  $: networkBtc = isTransactionNetworkBtc(selectedNetwork);
</script>

<div data-tid="transaction-step-2">
  <div class="info">
    <TransactionSource account={sourceAccount} />

    <div class="highlight">
      <span class="icon">
        <IconSouth />
      </span>
      <div class="align-right">
        <AmountDisplay amount={tokenAmount} inline />
        <span>
          <AmountDisplay amount={transactionFee} singleLine />
          {$i18n.accounts.new_transaction_fee}
        </span>
      </div>
    </div>

    <div>
      <p class="label">{$i18n.accounts.destination}</p>
      <p class="account-identifier value">
        <slot name="destination-info" />
        {destinationAddress}
      </p>
    </div>

    {#if nonNullish(selectedNetwork)}
      <div>
        <p class="label">{$i18n.accounts.network}</p>
        <p class="value">
          {$i18n.accounts[selectedNetwork]}
        </p>
      </div>
    {/if}

    <div>
      <p class="label">{$i18n.accounts.description}</p>
      <slot name="description" />
    </div>

    <slot name="additional-info" />

    {#if networkBtc}
      <div>
        <p class="label">{$i18n.ckbtc.estimated_receive_time}</p>
        <p class="value">
          {$i18n.ckbtc.about_thirty_minutes}
        </p>
      </div>
    {/if}
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
  .account-identifier {
    word-break: break-all;
  }

  .highlight {
    padding: var(--padding-2x);
    display: flex;
    justify-content: center;
    align-items: center;
    gap: var(--padding);

    .icon {
      color: var(--primary);
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .align-right {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: flex-start;
    }
  }

  .info {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }
</style>
