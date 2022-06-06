<script lang="ts">
  import type { ICP } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { formatICP } from "../../utils/icp.utils";

  export let icp: ICP;
  export let label: string = $i18n.core.icp;
  export let inline: boolean = false;
  export let sign: "+" | "-" | "" = "";
  export let detailed: boolean = false;
</script>

{#if icp}
  <div class:inline class:plus-sign={sign === "+"}>
    <span data-tid="icp-value"
      >{`${sign}${formatICP({ value: icp.toE8s(), detailed })}`}</span
    >
    <span>{label}</span>
  </div>
{/if}

<style lang="scss">
  @use "../../themes/mixins/media.scss";

  div {
    display: inline-grid;
    grid-template-columns: repeat(2, auto);
    grid-gap: 5px;
    align-items: baseline;

    span:first-of-type {
      font-weight: 700;
      font-size: var(--icp-font-size, var(--font-size-h3));
      color: inherit;
    }

    &:not(.inline) {
      @include media.min-width(medium) {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        justify-content: flex-end;
        grid-gap: 0;
      }
    }

    &.plus-sign {
      color: var(--green-500-tint);

      span:first-of-type {
        color: var(--green-500);
      }
    }
  }
</style>
