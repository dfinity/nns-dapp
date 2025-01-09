<script lang="ts">
  import LoginCard from "$lib/components/portfolio/LoginCard.svelte";
  import NoNeuronsCard from "$lib/components/portfolio/NoNeuronsCard.svelte";
  import NoTokensCard from "$lib/components/portfolio/NoTokensCard.svelte";
  import UsdValueBanner from "$lib/components/ui/UsdValueBanner.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import type { UserToken } from "$lib/types/tokens-page";
  import { getTotalBalanceInUsd } from "$lib/utils/token.utils";
  import { TokenAmountV2, isNullish } from "@dfinity/utils";

  export let userTokensData: UserToken[] = [];

  let totalTokensBalanceInUsd: number;
  $: totalTokensBalanceInUsd = getTotalBalanceInUsd(userTokensData);

  let hasUnpricedTokens: boolean;
  $: hasUnpricedTokens = userTokensData.some(
    (token) =>
      token.balance instanceof TokenAmountV2 &&
      token.balance.toUlps() > 0n &&
      (!("balanceInUsd" in token) || isNullish(token.balanceInUsd))
  );

  let totalUsdAmount: number | undefined;
  $: totalUsdAmount = $authSignedInStore ? totalTokensBalanceInUsd : undefined;

  let showNoTokensCard: boolean;
  $: showNoTokensCard = !$authSignedInStore || totalTokensBalanceInUsd === 0;
</script>

<main data-tid="portfolio-page-component">
  <div class="top" class:single-card={$authSignedInStore}>
    {#if !$authSignedInStore}
      <LoginCard />
    {/if}
    <UsdValueBanner usdAmount={totalUsdAmount} {hasUnpricedTokens} />
  </div>
  <div class="content">
    {#if showNoTokensCard}
      <NoTokensCard />
    {/if}
    <NoNeuronsCard />
  </div>
</main>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  main {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
    padding: var(--padding-2x);

    @include media.min-width(large) {
      display: grid;
      grid-template-rows: auto 1fr;
      gap: var(--padding-3x);
      padding: var(--padding-3x);
    }

    .top {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--padding-2x);

      @include media.min-width(large) {
        grid-template-columns: 1fr 2fr;

        > :global(article:first-of-type) {
          order: 1;
        }

        &.single-card {
          grid-template-columns: 1fr;
        }
      }
    }

    .content {
      display: grid;
      grid-template-columns: 1fr;
      gap: var(--padding-2x);

      @include media.min-width(large) {
        grid-template-columns: repeat(2, 1fr);
        grid-auto-rows: min-content;
        align-items: stretch;
      }
    }
  }
</style>
