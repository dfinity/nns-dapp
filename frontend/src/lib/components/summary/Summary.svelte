<script lang="ts">
  import SummaryProjectLogo from "$lib/components/summary/SummaryProjectLogo.svelte";
  import { ENABLE_SNS } from "$lib/constants/environment.constants";
  import SelectProjectDropdownWrapper from "$lib/components/universe/SelectProjectDropdownWrapper.svelte";
  import { i18n } from "$lib/stores/i18n";

  export let selectProjects = ENABLE_SNS;
</script>

<div
  class="summary"
  data-tid="accounts-summary"
  class:dropdown={selectProjects}
>
  <div class="logo" class:dropdown={selectProjects} data-tid="summary-logo">
    <SummaryProjectLogo size="big" {selectProjects} />
  </div>

  {#if selectProjects}
    <SelectProjectDropdownWrapper />
  {:else}
    <h1>{$i18n.core.ic}</h1>
  {/if}

  <slot name="details" />
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";
  @use "@dfinity/gix-components/styles/mixins/text";

  @mixin columns {
    display: grid;
    grid-template-columns: repeat(2, auto);

    column-gap: var(--padding-2x);

    margin: var(--padding) 0 var(--padding-3x);

    width: fit-content;
  }

  .summary {
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0 0 var(--padding-3x);
    max-width: 100%;

    &:not(.dropdown) {
      @include columns;
    }

    @include media.min-width(small) {
      @include columns;
    }

    word-break: break-all;
  }

  h1 {
    display: inline-block;
    @include text.truncate;
    margin: 0;
  }

  .logo {
    grid-row: 1 / 3;

    &.dropdown {
      --logo-display: none;

      @include media.min-width(small) {
        --logo-display: block;
      }
    }
  }
</style>
