<script lang="ts">
  import Copy from "$lib/components/ui/Copy.svelte";
  import PrivacyAwareAmount from "$lib/components/ui/PrivacyAwareAmount.svelte";
  import {
    FailedTokenAmount,
    formatTokenV2,
    UnavailableTokenAmount,
  } from "$lib/utils/token.utils";
  import { TokenAmount, TokenAmountV2 } from "@dfinity/utils";

  type Props = {
    amount: TokenAmount | TokenAmountV2 | UnavailableTokenAmount;
    label?: string;
    inline?: boolean;
    singleLine?: boolean;
    title?: boolean;
    copy?: boolean;
    text?: boolean;
    size?: "inherit" | "huge";
    sign?: "+" | "-" | "";
    detailed?: boolean | "height_decimals";
    hideValue?: boolean;
  };

  const {
    amount,
    label = undefined,
    inline = false,
    singleLine = false,
    title = false,
    copy = false,
    text = false,
    size = undefined,
    sign = "",
    detailed = false,
    hideValue = false,
  }: Props = $props();

  const isValidAmount = (
    amount:
      | TokenAmount
      | TokenAmountV2
      | UnavailableTokenAmount
      | FailedTokenAmount
  ): amount is TokenAmount | TokenAmountV2 =>
    amount instanceof TokenAmount || amount instanceof TokenAmountV2;

  const formattedValue = $derived(
    isValidAmount(amount)
      ? `${sign}${formatTokenV2({ value: amount, detailed })}`
      : "-/-"
  );
</script>

<div
  class:inline
  class:singleLine
  class:inheritSize={size === "inherit"}
  class:title
  class:copy
  class:text
  class:huge={size === "huge"}
  class:plus-sign={sign === "+"}
  data-tid="token-value-label"
>
  <span
    data-tid="token-value"
    class="value"
    class:tabular-num={detailed === "height_decimals"}
  >
    {#if hideValue}
      <PrivacyAwareAmount value={formattedValue} length={3} />
    {:else}
      {formattedValue}
    {/if}</span
  >
  <span class="label">{label !== undefined ? label : amount.token.symbol}</span
  >{#if copy && isValidAmount(amount)}
    {" "}
    <Copy value={formatTokenV2({ value: amount, detailed: true })} />
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  div {
    display: inline-flex;
    gap: var(--padding-0_5x);
    align-items: baseline;

    span:first-of-type {
      font-weight: var(--font-weight-bold);
      font-size: var(--token-font-size, var(--font-size-h3));
    }

    .label {
      color: var(--amount-display-symbol-color, inherit);
    }

    &.singleLine span:first-of-type {
      font-weight: var(--amount-weight, normal);
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

    &.huge span.value {
      font-size: var(--font-size-huge);
    }
  }

  .value {
    color: var(--amount-color, var(--value-color));
  }
</style>
