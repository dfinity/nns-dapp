<script lang="ts">
  import SummaryLogo from "$lib/components/summary/SummaryLogo.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";

  export let displayProjects = true;

  let text = $i18n.core.ic;
  $: text = displayProjects
    ? $snsProjectSelectedStore?.summary.metadata.name ?? $i18n.core.ic
    : $i18n.core.ic;

  let twoLines = true;
  $: twoLines = $$slots.details !== undefined;
</script>

<div class="summary" data-tid="projects-summary">
  <h1 class="title">
    <span>{text}</span>

    <SummaryLogo {displayProjects} />
  </h1>

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

  .summary {
    display: flex;
    flex-direction: column;

    margin: 0 0 var(--padding-3x);
  }

  .title {
    display: inline-flex;
  }

  span {
    @include fonts.h3;

    max-width: calc(100% - var(--padding-6x));
    @include text.truncate;

    margin: 0;
  }

  .details {
    height: var(--padding-4x);
    color: var(--description-color);
    @include fonts.small;
  }
</style>
