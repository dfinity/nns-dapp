<script lang="ts">
  import type { UserTokenData } from "$lib/types/tokens-page";
  import Row from "./DesktopTokensTableRow.svelte";

  export let userTokensData: UserTokenData[];
</script>

<div role="table" data-tid="desktop-tokens-table-component">
  <div role="rowgroup">
    <div role="row" class="header-row">
      <span role="cell">Projects</span>
      <span role="cell" class="header-right">Balance</span>
      <span role="cell"></span>
    </div>
  </div>
  <div role="rowgroup">
    {#each userTokensData as userTokenData, index}
      <div class="row-wrapper">
        <Row on:nnsAction {userTokenData} {index} />
      </div>
    {/each}
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  div[role="table"] {
    width: 100%;

    display: flex;
    flex-direction: column;

    @include media.min-width(medium) {
      display: grid;
      grid-template-columns: 1fr max-content max-content;
      column-gap: var(--padding-2x);
    }

    .header-row {
      color: var(--text-description);
      background-color: var(--table-header-background);

      font-weight: normal;
      font-size: var(--font-size-small);

      padding: var(--padding) var(--padding-2x);

      border-bottom: 1px solid var(--elements-divider);

      [role="cell"] {
        display: none;

        &:first-child {
          display: block;
        }

        @include media.min-width(medium) {
          display: block;
        }
      }

      .header-right {
        text-align: right;
      }
    }

    [role="rowgroup"] {
      @include media.min-width(medium) {
        display: grid;
        grid-column: 1 / -1;
        grid-template-columns: subgrid;
      }
    }

    [role="row"] {
      @include media.min-width(medium) {
        display: grid;
        grid-column: 1 / -1;
        grid-template-columns: subgrid;
      }
    }

    .row-wrapper {
      border-bottom: 1px solid var(--elements-divider);

      @include media.min-width(medium) {
        border-bottom: none;
        display: grid;
        grid-column: 1 / -1;
        grid-template-columns: subgrid;
      }
    }
  }
</style>
