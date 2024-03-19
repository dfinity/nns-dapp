<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import type { UserToken } from "$lib/types/tokens-page";
  import { nonNullish } from "@dfinity/utils";
  import TokensTableRow from "./TokensTableRow.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";

  export let userTokensData: Array<UserToken>;
  export let firstColumnHeader: string;

  // This will be useful when we create the generic table.
  // The column styles will depend on the columns metadata.
  // And we don't have the columns metadata in the `style` tag.
  const desktopColumnsStyle = () => {
    return "1fr max-content max-content";
  };
</script>

<div
  role="table"
  data-tid="tokens-table-component"
  style={`grid-template-columns: ${desktopColumnsStyle()};`}
>
  <div role="rowgroup">
    <div role="row" class="header-row">
      <span role="columnheader" data-tid="column-header-1"
        >{firstColumnHeader}</span
      >
      <span role="columnheader" data-tid="column-header-2" class="header-right"
        >{$i18n.tokens.balance_header}</span
      >
      <span role="columnheader" class="header-right header-icon">
        <slot name="header-icon" />
      </span>
    </div>
  </div>
  <div role="rowgroup">
    {#each userTokensData as userTokenData}
      <div class="row-wrapper">
        <TokensTableRow on:nnsAction {userTokenData} />
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
      // `grid-template-columns` set with inline style.
      column-gap: var(--padding-2x);
    }

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;

      color: var(--text-description);
      background-color: var(--table-header-background);

      font-weight: normal;
      font-size: var(--font-size-small);

      padding: 0 var(--padding-2x);
      height: var(--padding-4x);

      border-bottom: 1px solid var(--elements-divider);

      [role="columnheader"] {
        display: none;

        &:first-child,
        &:last-child {
          display: block;
        }

        @include media.min-width(medium) {
          display: block;
        }
      }

      .header-right {
        text-align: right;
      }

      .header-icon {
        // Prevents the element taking up more height than the icon by adding
        // space for descenders.
        line-height: 0;
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
