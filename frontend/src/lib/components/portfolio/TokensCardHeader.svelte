<script lang="ts">
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { formatCurrencyNumber } from "$lib/utils/format.utils";
  import { IconRight } from "@dfinity/gix-components";

  export let usdAmount: number;
  export let href: string;
  export let title: string;
  export let linkText: string;

  let usdAmountFormatted: string;
  $: usdAmountFormatted = $authSignedInStore
    ? formatCurrencyNumber(usdAmount)
    : PRICE_NOT_AVAILABLE_PLACEHOLDER;
</script>

<div class="header">
  <div class="header-wrapper">
    <div class="icon" aria-hidden="true">
      <slot name="icon" />
    </div>
    <div class="text-content">
      <h5 class="title">{title}</h5>
      <p class="amount" data-tid="amount" aria-label={`${title}: ${usdAmount}`}>
        ${usdAmountFormatted}
      </p>
    </div>
  </div>
  <a {href} class="button secondary link" aria-label={linkText}>
    <span class="icon">
      <IconRight />
    </span>
    <span class="text">
      {linkText}
    </span>
  </a>
</div>

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
        gap: var(--padding-0_5x);

        .title {
          font-size: 0.875rem;
          font-weight: bold;
          color: var(--text-description);
          margin: 0;
          padding: 0;
        }
        .amount {
          font-size: 1.5rem;
        }
      }
    }

    .link {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      min-height: auto;
      padding: 0;

      @include media.min-width(medium) {
        width: auto;
        height: auto;
        padding: var(--padding) var(--padding-2x);
        border-radius: var(--border-radius);
        min-height: var(--button-min-height);
      }

      .icon {
        display: flex;
        @include media.min-width(medium) {
          display: none;
        }
      }

      .text {
        display: none;
        @include media.min-width(medium) {
          display: inline;
        }
      }
    }
  }
</style>
