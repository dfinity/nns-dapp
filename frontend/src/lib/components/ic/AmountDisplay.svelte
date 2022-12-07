<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import { formatToken } from "$lib/utils/token.utils";
  import { Copy } from "@dfinity/gix-components";

  export let amount: TokenAmount;
  export let label: string | undefined = undefined;
  export let inline = false;
  export let singleLine = false;
  export let title = false;
  export let copy = false;
  export let inheritSize = false;
  export let sign: "+" | "-" | "" = "";
  export let detailed = false;
</script>

<div
  class:inline
  class:singleLine
  class:inheritSize
  class:title
  class:copy
  class:plus-sign={sign === "+"}
  data-tid="token-value-label"
>
  <slot />
  <span data-tid="token-value" class="value"
    >{`${sign}${formatToken({ value: amount.toE8s(), detailed })}`}</span
  >
  <span class="label">{label !== undefined ? label : amount.token.symbol}</span>

  {#if copy}
    <Copy value={formatToken({ value: amount.toE8s(), detailed: true })} />
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";
  @use "@dfinity/gix-components/styles/mixins/fonts";

  div {
    display: inline-grid;
    grid-template-columns: repeat(2, auto);
    grid-gap: 5px;
    align-items: baseline;

    span:first-of-type {
      font-weight: var(--font-weight-bold);
      font-size: var(--token-font-size, var(--font-size-h3));
    }

    &.singleLine span:first-of-type {
      font-weight: normal;
      font-size: var(--font-size-h5);
    }

    &.inheritSize span:first-of-type {
      font-size: inherit;
    }

    &:not(.inline, .singleLine) {
      @include media.min-width(medium) {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: flex-end;
        grid-gap: 0;
      }
    }

    &.plus-sign {
      .value {
        color: var(--positive-emphasis);
      }

      .label {
        color: rgba(var(--positive-emphasis-rgb), var(--light-opacity));
      }
    }

    &.title,
    &.copy {
      display: block;
      word-break: break-word;

      span.label {
        @include fonts.small;
      }
    }

    &.title {
      span.value {
        @include fonts.h1(true);
      }
    }

    &.copy {
      span.value {
        @include fonts.standard(true);
      }

      vertical-align: sub;

      :global(button) {
        vertical-align: sub;
      }
    }
  }

  .value {
    color: var(--amount-color, var(--value-color));
  }
</style>
