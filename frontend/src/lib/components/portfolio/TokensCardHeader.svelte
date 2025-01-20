<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconRight } from "@dfinity/gix-components";

  export let usdAmount: number;
  export let usdAmountFormatted: string;
  export let href: string;
</script>

<div class="header">
  <div class="header-wrapper">
    <div class="icon" aria-hidden="true">
      <slot name="icon" />
    </div>
    <div class="text-content">
      <h5 class="title">{$i18n.portfolio.held_tokens_card_title}</h5>
      <p
        class="amount"
        data-tid="amount"
        aria-label={`${$i18n.portfolio.held_tokens_card_title}: ${usdAmount}`}
      >
        ${usdAmountFormatted}
      </p>
    </div>
  </div>
  <a {href} class="link" aria-label={$i18n.portfolio.held_tokens_card_link}>
    <span class="icon">
      <IconRight />
    </span>
    <span class="text">
      {$i18n.portfolio.held_tokens_card_link}
    </span>
  </a>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/button";

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
      @include button.secondary;

      width: 35px;
      height: 35px;
      border-radius: 50%;

      display: inline-flex;
      align-items: center;
      justify-content: center;

      box-sizing: border-box;

      text-decoration: none;

      @include media.min-width(medium) {
        height: auto;
        width: auto;
        @include button.base;
        @include button.secondary;
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
