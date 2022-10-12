<script lang="ts">
  import { TokenAmount, type Token } from "@dfinity/nns";
  import { createEventDispatcher } from "svelte";
  import { IconSouth } from "@dfinity/gix-components";
  import { busy } from "$lib/stores/busy.store";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import type { NewTransaction } from "$lib/types/transaction";
  import TransactionSource from "$lib/modals/accounts/NewTransaction/TransactionSource.svelte";

  export let transaction: NewTransaction;
  export let disableSubmit: boolean;
  export let transactionFee: TokenAmount;
  export let token: Token;

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
      <slot name="destination-info" />
      <p class="account-identifier">{destinationAddress}</p>
    </div>

    <div>
      <p class="label">{$i18n.accounts.description}</p>
      <slot name="description" />
    </div>

    <div class="additional-info">
      <slot name="additional-info" />
    </div>
  </div>

  <div class="toolbar">
    <button class="secondary" data-tid="transaction-button-back" on:click={back}
      >{$i18n.accounts.edit_transaction}</button
    >
    <button
      class="primary"
      data-tid="transaction-button-execute"
      disabled={$busy || disableSubmit}
      on:click={submit}>{$i18n.accounts.execute}</button
    >
  </div>
</div>

<style lang="scss">
  @use "../../../themes/mixins/modal";

  .balance {
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: var(--padding-1_5x);
  }

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

  .additional-info {
    padding-top: var(--padding-2x);
  }
</style>
