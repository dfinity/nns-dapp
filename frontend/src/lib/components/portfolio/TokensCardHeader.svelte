<script lang="ts">
  import { IconRight, Spinner } from "@dfinity/gix-components";

  export let usdAmount: number;
  export let usdAmountFormatted: string;
  export let href: string;
  export let title: string;
  export let linkText: string;
  export let isLoading: boolean = false;
</script>

<div class="header">
  <div class="header-wrapper">
    <div class="icon" aria-hidden="true">
      <slot name="icon" />
    </div>
    <div class="text-content">
      <h5 class="title">{title}</h5>
      <p class="amount" data-tid="amount" aria-label={`${title}: ${usdAmount}`}>
        {#if !isLoading}
          ${usdAmountFormatted}
        {:else}
          <Spinner inline size="small" />
        {/if}
      </p>
    </div>
  </div>
  <a {href} class="button link" aria-label={linkText}>
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
          align-self: flex-start;
        }
      }
    }

    .link {
      width: 35px;
      height: 35px;
      border-radius: 50%;

      // TODO: This is necessary because using the button mixins from GIX generates warnings about unused styles.
      // The styles in question relate to the disabled attribute, which does not apply to the anchor element.
      // This is a temporary fix until those mixins are updated to include the disabled state as an additional mixin.
      color: var(--button-secondary-color);
      border: solid var(--button-border-size) var(--primary);
      @include media.min-width(medium) {
        width: auto;
        height: auto;
        padding: var(--padding) var(--padding-2x);
        border-radius: var(--border-radius);
        position: relative;
        min-height: var(--button-min-height);
        font-weight: var(--font-weight-bold);
        &:focus {
          filter: contrast(1.25);
        }
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
