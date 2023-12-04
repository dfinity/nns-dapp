<script lang="ts">
  import { nonNullish, type TokenAmount, TokenAmountV2 } from "@dfinity/utils";
  import PageHeading from "../common/PageHeading.svelte";
  import { SkeletonText } from "@dfinity/gix-components";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import HeadingSubtitle from "../common/HeadingSubtitle.svelte";
  import type { Principal } from "@dfinity/principal";
  import { onIntersection } from "$lib/directives/intersection.directives";
  import type { IntersectingDetail } from "$lib/types/intersection.types";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import { formatTokenV2 } from "$lib/utils/token.utils";
  import IdentifierHash from "../ui/IdentifierHash.svelte";
  import Tooltip from "../ui/Tooltip.svelte";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";

  export let balance: TokenAmount | TokenAmountV2 | undefined = undefined;
  export let accountName: string;
  export let principal: Principal | undefined = undefined;

  let detailedAccountBalance: string | undefined;
  $: detailedAccountBalance = nonNullish(balance)
    ? formatTokenV2({
        value: balance,
        detailed: true,
      })
    : undefined;

  const updateLayoutTitle = ($event: Event) => {
    const {
      detail: { intersecting },
    } = $event as unknown as CustomEvent<IntersectingDetail>;

    layoutTitleStore.set({
      title: $i18n.wallet.title,
      header:
        intersecting && nonNullish(balance)
          ? $i18n.wallet.title
          : `${accountName} - ${formatTokenV2({
              value: balance,
            })} ${balance?.token.symbol}`,
    });
  };
</script>

<PageHeading testId="wallet-page-heading-component">
  <svelte:fragment slot="title">
    <!-- TS is not smart enough to understand that if `balance` is defined, then `detailedAccountBalance` is also defined -->
    {#if nonNullish(balance) && nonNullish(detailedAccountBalance)}
      <Tooltip
        id="wallet-detailed-icp"
        text={replacePlaceholders($i18n.accounts.current_balance_detail, {
          $amount: detailedAccountBalance,
          $token: balance.token.symbol,
        })}
      >
        <AmountDisplay amount={balance} size="huge" singleLine />
      </Tooltip>
    {:else}
      <div data-tid="skeleton" class="skeleton">
        <SkeletonText tagName="h1" />
      </div>
    {/if}
  </svelte:fragment>
  <div
    slot="subtitle"
    class="subtitles"
    data-tid="wallet-subtitles"
    on:nnsIntersecting={updateLayoutTitle}
    use:onIntersection
  >
    <HeadingSubtitle testId="wallet-page-heading-subtitle">
      {accountName}
    </HeadingSubtitle>
    {#if nonNullish(principal)}
      <p class="description" data-tid="wallet-page-heading-principal">
        {$i18n.core.principal}: <IdentifierHash
          identifier={principal.toText()}
        />
      </p>
    {/if}
  </div>
  <slot slot="tags" />
</PageHeading>

<style lang="scss">
  .subtitles {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
    justify-content: center;
    align-items: center;

    & p {
      margin: 0;
    }
  }

  .skeleton {
    // This is a width for the skeleton that looks good on desktop and mobile.
    // Based on $breakpoint-xsmall: 320px;
    width: 320px;
    max-width: calc(100% - var(--padding-2x));
  }
</style>
