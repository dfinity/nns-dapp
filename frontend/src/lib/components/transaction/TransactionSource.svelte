<script lang="ts">
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import { i18n } from "$lib/stores/i18n";
  import type { Account } from "$lib/types/account";
  import { KeyValuePair } from "@dfinity/gix-components";
  import { TokenAmountV2, type Token } from "@dfinity/utils";

  type Props = {
    account: Account;
    token: Token;
  };
  const { account, token }: Props = $props();

  const amount = $derived(
    TokenAmountV2.fromUlps({
      amount: account.balanceUlps,
      token,
    })
  );
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
  <AmountDisplay slot="value" singleLine detailed {amount} />
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
