<script lang="ts">
  import type { Account } from "$lib/types/account";
  import { Card } from "@dfinity/gix-components";
  import AmountDisplay from "$lib/components/ic/AmountDisplay.svelte";
  import Identifier from "$lib/components/ui/Identifier.svelte";
  import IdentifierHash from "$lib/components/ui/IdentifierHash.svelte";
  import AccountBadge from "./AccountBadge.svelte";
  import { nonNullish } from "@dfinity/utils";
  import { TokenAmount, type Token } from "@dfinity/utils";
  import { buildWalletUrl } from "$lib/utils/navigation.utils";
  import { pageStore } from "$lib/derived/page.derived";

  export let account: Account;
  export let hash = false;
  export let token: Token | undefined;
  export let role: "button" | "link" = "link";

  let identifier: string;
  let balanceE8s: bigint;

  $: ({ identifier, balanceE8s } = account);

  let href: string | undefined;
  $: href =
    role === "link"
      ? buildWalletUrl({
          universe: $pageStore.universe,
          account: identifier,
        })
      : undefined;
</script>

<Card on:click testId="account-card" {href}>
  <div slot="start" class="title">
    <p data-tid="account-name" class:main={account.type === "main"}><slot /></p>
    <AccountBadge {account} />
  </div>

  {#if nonNullish(token)}
    <AmountDisplay
      title
      amount={TokenAmount.fromE8s({
        amount: balanceE8s,
        token,
      })}
    />
  {/if}

  {#if hash}
    <IdentifierHash {identifier} />
  {:else}
    <Identifier {identifier} />
  {/if}
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/card";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .title {
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
</style>
