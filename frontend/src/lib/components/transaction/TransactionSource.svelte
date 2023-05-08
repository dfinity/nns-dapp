<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import type { Account } from "$lib/types/account";

  export let account: Account;
</script>

<p
  class="label account-name title"
  data-tid="transaction-review-source-account-name"
>
  {$i18n.accounts.from}: {account.name ?? $i18n.accounts.main}
</p>

<p
  data-tid="transaction-review-source-account"
  class="account-identifier value"
>
  {account.identifier}
</p>

<p class="label title">{$i18n.accounts.balance}</p>

<p class="balance">
  <AmountDisplay singleLine detailed amount={account.balance} />
</p>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/text";

  .title {
    margin: 0;
  }

  .account-name {
    word-break: break-all;
    @include text.clamp(2);
  }

  .account-identifier {
    word-break: break-all;
    margin: 0 0 var(--padding);
  }

  .balance {
    word-break: break-all;
    margin: 0;
  }
</style>
