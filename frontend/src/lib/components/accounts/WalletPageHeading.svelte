<script lang="ts">
  import { onIntersection } from "$lib/directives/intersection.directives";
  import { ENABLE_USD_VALUES } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import type { IntersectingDetail } from "$lib/types/intersection.types";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { formatTokenV2 } from "$lib/utils/token.utils";
  import HeadingSubtitle from "../common/HeadingSubtitle.svelte";
  import HeadingSubtitleWithUsdValue from "../common/HeadingSubtitleWithUsdValue.svelte";
  import PageHeading from "../common/PageHeading.svelte";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import IdentifierHash from "../ui/IdentifierHash.svelte";
  import { Tooltip } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { isNullish, nonNullish, type TokenAmountV2 } from "@dfinity/utils";

  export let balance: TokenAmountV2 | undefined = undefined;
  export let accountName: string;
  export let principal: Principal | undefined = undefined;
  export let ledgerCanisterId: Principal | undefined;

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
        intersecting || isNullish(balance)
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
      <h1 data-tid="balance-placeholder">-/-</h1>
    {/if}
  </svelte:fragment>
  <div
    slot="subtitle"
    class="subtitles"
    data-tid="wallet-subtitles"
    on:nnsIntersecting={updateLayoutTitle}
    use:onIntersection
  >
    {#if $ENABLE_USD_VALUES}
      <HeadingSubtitleWithUsdValue amount={balance} {ledgerCanisterId}>
        {accountName}
      </HeadingSubtitleWithUsdValue>
    {:else}
      <HeadingSubtitle testId="wallet-page-heading-subtitle">
        {accountName}
      </HeadingSubtitle>
    {/if}
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
</style>
