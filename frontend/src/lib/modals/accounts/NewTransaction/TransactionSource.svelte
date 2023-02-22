<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { KeyValuePair } from "@dfinity/gix-components";
  import type { Account } from "$lib/types/account";

  export let account: Account;
</script>

<KeyValuePair>
  <span class="label" slot="key">{$i18n.accounts.source}</span>
  <div class="balance" slot="value">
    <span class="label">{$i18n.accounts.balance}</span>
    <AmountDisplay singleLine amount={account.balance} />
  </div>
</KeyValuePair>

<div class="source value">
  <p data-tid="transaction-review-source-account-name">
    {account.name ?? $i18n.accounts.main}
  </p>
  <p data-tid="transaction-review-source-account" class="account-identifier">
    {account.identifier}
  </p>
</div>

<style lang="scss">
  .balance {
    display: flex;
    align-items: center;
    flex-direction: row;
    gap: var(--padding-1_5x);
  }

  .source {
    p:first-of-type {
      margin: 0;
    }

    p:last-of-type {
      margin-top: 0;
    }
  }

  .account-identifier {
    word-break: break-all;
  }
</style>
