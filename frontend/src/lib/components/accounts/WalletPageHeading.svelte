<script lang="ts">
  import { nonNullish, type TokenAmount } from "@dfinity/utils";
  import PageHeading from "../common/PageHeading.svelte";
  import { SkeletonText } from "@dfinity/gix-components";
  import AmountDisplay from "../ic/AmountDisplay.svelte";
  import HeadingSubtitle from "../common/HeadingSubtitle.svelte";
  import type { Principal } from "@dfinity/principal";
  import { onIntersection } from "$lib/directives/intersection.directives";
  import type { IntersectingDetail } from "$lib/types/intersection.types";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import { formatToken } from "$lib/utils/token.utils";
  import IdentifierHash from "../ui/IdentifierHash.svelte";
  import TestIdWrapper from "../common/TestIdWrapper.svelte";

  export let balance: TokenAmount | undefined = undefined;
  export let accountName: string;
  export let principal: Principal | undefined = undefined;

  const updateLayoutTitle = ($event: Event) => {
    const {
      detail: { intersecting },
    } = $event as unknown as CustomEvent<IntersectingDetail>;

    layoutTitleStore.set({
      title: $i18n.wallet.title,
      header:
        intersecting && nonNullish(balance)
          ? $i18n.wallet.title
          : `${accountName} - ${formatToken({
              value: balance?.toE8s() ?? 0n,
            })} ${balance?.token.symbol}`,
    });
  };
</script>

<PageHeading testId="wallet-page-heading-component">
  <TestIdWrapper slot="title" testId="wallet-page-heading-title">
    {#if nonNullish(balance)}
      <AmountDisplay amount={balance} size="huge" singleLine />
    {:else}
      <div data-tid="skeleton" class="skeleton">
        <SkeletonText tagName="h1" />
      </div>
    {/if}
  </TestIdWrapper>
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
