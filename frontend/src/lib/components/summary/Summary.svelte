<script lang="ts">
  import SummaryLogo from "$lib/components/summary/SummaryLogo.svelte";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import UniverseName from "$lib/components/universe/UniverseName.svelte";
  import { NNS_UNIVERSE } from "$lib/derived/selectable-universes.derived";

  export let displayUniverse = true;

  let twoLines = true;
  $: twoLines = $$slots.details !== undefined;
</script>

<div class="summary" data-tid="projects-summary">
  <h1 class="title">
    <span
      ><UniverseName
        universe={displayUniverse ? $selectedUniverseStore : NNS_UNIVERSE}
      /></span
    >

    <SummaryLogo {displayUniverse} />
  </h1>

  {#if twoLines}
    <div class="details">
      <slot name="details" />
    </div>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/text";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

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
