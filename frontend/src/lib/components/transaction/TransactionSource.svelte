<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { KeyValuePair } from "@dfinity/gix-components";
  import type { Account } from "$lib/types/account";

  export let account: Account;
  export let balance = true;
</script>

<KeyValuePair>
  <span
    class="label account-name"
    slot="key"
    data-tid="transaction-review-source-account-name"
    >{$i18n.accounts.source}: {account.name ?? $i18n.accounts.main}</span
  >
  <svelte:fragment slot="value">
    {#if balance}
      <div class="balance" data-tid="transaction-review-balance">
        <span class="label">{$i18n.accounts.balance}: </span>
        <AmountDisplay singleLine amount={account.balance} />
      </div>
    {/if}
  </svelte:fragment>
</KeyValuePair>

<p
  data-tid="transaction-review-source-account"
  class="account-identifier value"
>
  {account.identifier}
</p>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/text";

  .account-name {
    word-break: break-all;
    @include text.clamp(2);
  }

  .account-identifier {
    word-break: break-all;
    margin: 0;
  }
</style>
