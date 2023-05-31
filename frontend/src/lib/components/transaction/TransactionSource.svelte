<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { KeyValuePair } from "@dfinity/gix-components";
  import type { Account } from "$lib/types/account";
  import { type Token, TokenAmount } from "@dfinity/nns";

  export let account: Account;
  export let token: Token;

  let amount: TokenAmount;
  $: amount = TokenAmount.fromE8s({
    amount: account.balanceE8s,
    token,
  });
</script>

<p class="label account-name" data-tid="transaction-review-source-account-name">
  {$i18n.accounts.from}: {account.name ?? $i18n.accounts.main}
</p>

<p
  data-tid="transaction-review-source-account"
  class="account-identifier value"
>
  {account.identifier}
</p>

<KeyValuePair>
  <span class="label" slot="key">{$i18n.accounts.balance}</span>
  <AmountDisplay slot="value" singleLine detailed="height_decimals" {amount} />
</KeyValuePair>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/text";

  .account-name {
    word-break: break-all;
    @include text.clamp(2);
    margin: 0;
  }

  .account-identifier {
    word-break: break-all;
    margin: 0 0 var(--padding-2x);
  }
</style>
