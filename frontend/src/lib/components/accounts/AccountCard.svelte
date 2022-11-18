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
    <p data-tid="account-name" class:main={account.type === "main"}><slot /></p>
    <AccountBadge {account} />
  </div>
  <AmountDisplay title amount={balance} />
  <Identifier {identifier} {showCopy} />
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/card";
  @use "@dfinity/gix-components/styles/mixins/fonts";
  @use "@dfinity/gix-components/styles/mixins/media";

  .title {
    @include card.stacked-title;
    @include card.title;
  }

  p {
    margin: 0 0 var(--padding-0_5x);
    @include fonts.standard(true);
  }

  .title {
    min-height: 36px;
    justify-content: flex-start;
  }

  .main {
    color: var(--secondary);
  }

  @include media.light-theme {
    .main {
      color: var(--primary-tint);
    }
  }
</style>
