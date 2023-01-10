<script lang="ts">
  import SummaryLogo from "$lib/components/summary/SummaryLogo.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";

  export let size: "big" | "medium" | "small" = "big";
  export let displayProjects = true;

  let titleTag: "h1" | "h3" = "h1";
  $: titleTag = size === "big" ? "h1" : "h3";

  let text = $i18n.core.ic;
  $: text = displayProjects
    ? $snsProjectSelectedStore?.summary.metadata.name ?? $i18n.core.ic
    : $i18n.core.ic;

  let twoLines = true;
  $: twoLines = $$slots.details !== undefined;
</script>

<div class={`summary ${size}`} class:twoLines data-tid="accounts-summary">
  <div class="logo" data-tid="summary-logo">
    <SummaryLogo {size} {displayProjects} />
  </div>

  <svelte:element this={titleTag}>{text}</svelte:element>

  {#if twoLines}
    <div class="details">
      <slot name="details" />
    </div>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/styles/mixins/media";
  @use "@dfinity/gix-components/styles/mixins/text";
  @use "@dfinity/gix-components/styles/mixins/fonts";

  @mixin columns {
    display: grid;
    grid-template-columns: repeat(2, auto);

    column-gap: var(--padding-2x);

    margin: 0 0 var(--padding-3x);

    width: fit-content;
  }

  .summary {
    width: 100%;
    margin: 0 0 var(--padding-3x);
    max-width: 100%;

    @include columns;

    &:not(.big) {
      @include media.min-width(small) {
        column-gap: var(--padding-1_5x);
      }
    }

    word-break: break-all;
  }

  h1,
  h3 {
    display: inline-block;
    @include text.truncate;
    margin: 0;
  }

  h3 {
    margin-top: var(--padding-0_5x);
  }

  .twoLines {
    .logo {
      grid-row: 1 / 3;
    }
  }

  .details {
    height: var(--padding-4x);
    color: var(--description-color);
    @include fonts.small;
  }
</style>
