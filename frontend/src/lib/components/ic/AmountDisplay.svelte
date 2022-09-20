<script lang="ts">
  import type { TokenAmount } from "@dfinity/nns";
  import { formatICP } from "../../utils/icp.utils";

  export let amount: TokenAmount;
  export let label: string | undefined = undefined;
  export let sign: "+" | "-" | "" = "";
  export let detailed: boolean = false;
</script>

<div class={$$props.class} class:plus-sign={sign === "+"}>
  <span data-tid="icp-value" class="value"
    >{`${sign}${formatICP({ value: amount.toE8s(), detailed })}`}</span
  >
  <span class="label">{label !== undefined ? label : amount.token.symbol}</span>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";

  div {
    align-items: baseline;

    overflow-wrap: break-word;

    span {
      word-break: break-word;
    }

    span:first-of-type {
      font-weight: var(--icp-font-weight, var(--font-weight-bold));
      font-size: var(--icp-font-size, var(--font-size-h3));
      line-height: var(--line-height-title);
    }

    &.small {
      --icp-font-weight: normal;
      --icp-font-size: var(--font-size-h5);

      span:first-of-type {
        line-height: inherit;
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
