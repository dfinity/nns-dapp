<script lang="ts">
  import type { Account } from "$lib/types/account";
  import { Card } from "@dfinity/gix-components";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import Identifier from "$lib/components/ui/Identifier.svelte";
  import type { TokenAmount } from "@dfinity/nns";
  import AccountBadge from "./AccountBadge.svelte";

  export let account: Account;
  export let showCopy = false;
  export let role: "button" | "link" | undefined = undefined;

  let identifier: string;
  let balance: TokenAmount;

  $: ({ identifier, balance } = account);
</script>

<Card on:click {role} testId="account-card">
  <div slot="start" class="title">
    <h3 data-tid="account-name"><slot /></h3>
    <AccountBadge {account} />
  </div>
  <AmountDisplay slot="end" amount={balance} />
  <Identifier {identifier} {showCopy} />
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/card";

  .title {
    @include card.stacked-title;
    @include card.title;
  }
</style>
