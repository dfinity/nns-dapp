<script lang="ts">
  import type { ICP } from "@dfinity/nns";
  import { formatICP } from "../utils/icp.utils";

  export let icp: ICP;
</script>

{#if icp}
  <div>
    <span>{`${formatICP(icp.toE8s())}`}</span>
    <span>ICP</span>
  </div>
{/if}

<style lang="scss">
  div {
    display: flex;
    flex-direction: column;
    align-items: flex-end;

    span:first-of-type {
      font-weight: 700;
      font-size: var(--icp-font-size, var(--font-size-h3));
      color: var(--gray-50);
    }

    @media (max-width: 768px) {
      align-items: baseline;
      display: inline-grid;
      grid-template-columns: repeat(2, auto);
      grid-gap: 5px;
      justify-content: flex-end;
    }
  }
</style>
