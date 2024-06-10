<script lang="ts">
  import SummaryLogo from "$lib/components/summary/SummaryLogo.svelte";
  import { selectedUniverseStore } from "$lib/derived/selected-universe.derived";
  import UniverseLogo from "$lib/components/universe/UniverseLogo.svelte";
</script>

<div class="summary" data-tid="projects-summary">
  <h1 class="title">
    <span>{$selectedUniverseStore.title}</span>

    <UniverseLogo universe={$selectedUniverseStore} framed />
  </h1>
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
</style>
