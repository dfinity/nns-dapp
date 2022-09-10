<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import { formatICP } from "../../utils/icp.utils";

  export let amount: TokenAmount;
  export let label: string | undefined = undefined;
  export let inline: boolean = false;
  export let singleLine: boolean = false;
  export let inheritSize: boolean = false;
  export let sign: "+" | "-" | "" = "";
  export let detailed: boolean = false;
</script>

<div
  class:inline
  class:singleLine
  class:inheritSize
  class:plus-sign={sign === "+"}
>
  <span data-tid="icp-value" class="value"
    >{`${sign}${formatICP({ value: amount.toE8s(), detailed })}`}</span
  >
  <span class="label">{label !== undefined ? label : amount.token.symbol}</span>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  div {
    display: inline-grid;
    grid-template-columns: repeat(2, auto);
    grid-gap: 5px;
    align-items: baseline;

    span:first-of-type {
      font-weight: 700;
      font-size: var(--icp-font-size, var(--font-size-h3));
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
  }
</style>
