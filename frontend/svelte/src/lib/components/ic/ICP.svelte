<script lang="ts">
  import type { ICP } from "@dfinity/nns";
  import { i18n } from "../../stores/i18n";
  import { formatICP } from "../../utils/icp.utils";

  export let icp: ICP;
  export let label: string = $i18n.core.icp;
</script>

{#if icp}
  <div>
    <span data-tid="icp-value">{`${formatICP(icp.toE8s())}`}</span>
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
      color: var(--gray-50);
    }

    @include media.min-width(medium) {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: flex-end;
      grid-gap: 0;
    }
  }
</style>
