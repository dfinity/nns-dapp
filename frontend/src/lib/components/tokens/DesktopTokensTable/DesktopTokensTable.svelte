<script lang="ts">
  import type { UserTokenData } from "$lib/types/tokens-page";
  import Row from "./DesktopTokensTableRow.svelte";

  export let userTokensData: UserTokenData[];
</script>

<div role="table" data-tid="desktop-tokens-table-component">
  <div role="rowgroup">
    <div role="row" class="header-row">
      <span role="cell" class="header-left">Projects</span>
      <span role="cell" class="header-right">Balance</span>
    </div>
  </div>
  <div role="rowgroup">
    {#each userTokensData as userTokenData, index}
      <Row on:nnsAction {userTokenData} {index} />
    {/each}
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  div[role="table"] {
    width: 100%;

    .header-row {
      color: var(--text-description);
      background-color: var(--table-header-background);

      display: grid;
      grid-template-columns: repeat(2, 1fr);

      font-weight: normal;
      font-size: var(--font-size-small);

      padding: var(--padding) var(--padding-2x);

      border-bottom: 1px solid var(--elements-divider);
    }

    .header-right {
      display: none;

      @include media.min-width(medium) {
        display: block;
        text-align: right;
      }
    }
  }
</style>
