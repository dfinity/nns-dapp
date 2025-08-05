<script lang="ts">
  import PrivacyAwareAmount from "$lib/components/ui/PrivacyAwareAmount.svelte";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { isMobileViewportStore } from "$lib/derived/viewport.derived";
  import { formatCurrencyNumber } from "$lib/utils/format.utils";
  import { IconRight } from "@dfinity/gix-components";
  import type { Snippet } from "svelte";

  type Props = {
    usdAmount: number;
    href: string;
    title: string;
    linkText: string;
    icon: Snippet;
  };

  const { usdAmount, href, title, linkText, icon }: Props = $props();

  const usdAmountFormatted = $derived(
    $authSignedInStore
      ? formatCurrencyNumber(usdAmount)
      : PRICE_NOT_AVAILABLE_PLACEHOLDER
  );
</script>

{#snippet content()}
  <div class="header-wrapper">
    <div class="icon" aria-hidden="true">
      {@render icon()}
    </div>
    <div class="text-content">
      <h5 class="title">{title}</h5>
      <p class="amount" data-tid="amount" aria-label={`${title}: ${usdAmount}`}>
        $<PrivacyAwareAmount value={usdAmountFormatted} length={3} />
      </p>
    </div>
  </div>
{/snippet}

{#if $isMobileViewportStore}
  <a {href} class="header mobile" aria-label={linkText}>
    {@render content()}
    <span class="icon-link">
      <IconRight />
    </span>
  </a>
{:else}
  <div class="header">
    {@render content()}
    <a {href} class="button secondary link" aria-label={linkText}>
      {linkText}
    </a>
  </div>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--padding-3x) var(--padding-2x);

    .header-wrapper {
      display: flex;
      align-items: flex-start;
      gap: var(--padding-2x);

      .icon {
        width: 50px;
        height: 50px;
      }

      .text-content {
        display: flex;
        flex-direction: column;

        .title {
          margin: 0;
          padding: 0;
          font-size: 12px;
          font-weight: bold;
          color: var(--text-description);

          @include media.min-width(medium) {
            font-size: 14px;
          }
        }
        .amount {
          margin: 0;
          padding: 0;
          font-size: 24px;
          line-height: 32px;

          @include media.min-width(medium) {
            font-size: 27px;
          }
        }
      }
    }

    .link {
      width: auto;
      height: auto;
      padding: var(--padding) var(--padding-2x);
      border-radius: var(--border-radius);
      min-height: var(--button-min-height);
    }
  }

  .mobile {
    text-decoration: none;

    .icon-link {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 35px;
      height: 35px;
      padding: 0;
      color: var(--button-secondary-color);
      font-weight: var(--font-weight-bold);
      border: solid var(--button-border-size) var(--primary);
      border-radius: 50%;
    }
  }
</style>
