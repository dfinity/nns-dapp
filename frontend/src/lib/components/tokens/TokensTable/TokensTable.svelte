<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { UserToken } from "$lib/types/tokens-page";
  import { nonNullish } from "@dfinity/utils";
  import Row from "./TokensTableRow.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let userTokensData: Array<UserToken>;
  export let firstColumnHeader: string;
</script>

<div role="table" data-tid="tokens-table-component">
  <div role="rowgroup">
    <div role="row" class="header-row">
      <span role="columnheader" data-tid="column-header-1"
        >{firstColumnHeader}</span
      >
      <span role="columnheader" data-tid="column-header-2" class="header-right"
        >{$i18n.tokens.balance_header}</span
      >
      <span role="columnheader"></span>
    </div>
  </div>
  <div role="rowgroup">
    {#each userTokensData as userTokenData, index}
      <div class="row-wrapper">
        <Row on:nnsAction {userTokenData} {index} />
      </div>
    {/each}
  </div>
  {#if nonNullish($$slots["last-row"])}
    <TestIdWrapper testId="last-row">
      <slot name="last-row" />
    </TestIdWrapper>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "../../../themes/mixins/grid-table";

  div[role="table"] {
    width: 100%;

    display: flex;
    flex-direction: column;

    border-radius: var(--border-radius);
    // Otherwise the non-rounded corners of the header and last row would be visible.
    overflow: hidden;

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

      [role="columnheader"] {
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

    [role="rowgroup"],
    [role="row"],
    .row-wrapper {
      @include media.min-width(medium) {
        @include grid-table.row;
      }
    }

    .row-wrapper {
      border-bottom: 1px solid var(--elements-divider);

      &:last-child {
        border-bottom: none;
      }

      @include media.min-width(medium) {
        border-bottom: none;
      }
    }
  }
</style>
