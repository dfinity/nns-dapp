<script lang="ts">
  import type { TokenAmount } from "@dfinity/utils";
  import { formatToken } from "$lib/utils/token.utils";
  import { Copy } from "@dfinity/gix-components";

  // TODO: should we expose two properties - an amount in bigint and a token Token - and build the TokenAmount.fromE8s in this component?
  export let amount: TokenAmount;
  export let label: string | undefined = undefined;
  export let inline = false;
  export let singleLine = false;
  export let title = false;
  export let copy = false;
  export let text = false;
  export let inheritSize = false;
  export let sign: "+" | "-" | "" = "";
  export let detailed: boolean | "height_decimals" = false;
</script>

<div
  class:inline
  class:singleLine
  class:inheritSize
  class:title
  class:copy
  class:text
  class:plus-sign={sign === "+"}
  data-tid="token-value-label"
>
  <span
    data-tid="token-value"
    class="value"
    class:tabular-num={detailed === "height_decimals"}
    >{`${sign}${formatToken({ value: amount.toE8s(), detailed })}`}</span
  >
  <span class="label">{label !== undefined ? label : amount.token.symbol}</span>

  {#if copy}
    <Copy value={formatToken({ value: amount.toE8s(), detailed: true })} />
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  div {
    display: inline-grid;
    grid-template-columns: repeat(2, auto);
    grid-gap: var(--padding-0_5x);
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
    &.text,
    &.copy {
      display: block;
      word-break: break-word;

      span.label {
        @include fonts.small;
      }
    }

    &.title,
    &.copy.title {
      span.value {
        @include fonts.h2(true);

        @include media.min-width(medium) {
          @include fonts.h1(true);
        }
      }
    }

    &.text,
    &.copy {
      span.value {
        font-size: var(--token-font-size, var(--font-size-standard));
        font-weight: var(--font-weight-bold);
      }

      vertical-align: sub;

      :global(button) {
        vertical-align: sub;
      }
    }

    &.copy {
      span.value {
        // Custom line-height in case the value is spread on multiple lines - we have to amend the particular size of the copy button
        line-height: 1.8;
      }
    }
  }

  .value {
    color: var(--amount-color, var(--value-color));
  }
</style>
