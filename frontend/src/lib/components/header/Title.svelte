<script lang="ts">
  import { triggerDebugReport } from "$lib/directives/debug.directives";
  import { layoutTitleStore } from "$lib/stores/layout.store";

  let pageTitle = $derived(
    $layoutTitleStore.title + " | Network Nervous System"
  );
  let toolbarTitle = $derived(
    $layoutTitleStore.header || $layoutTitleStore.title
  );
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<div use:triggerDebugReport>
  <h1>{toolbarTitle}</h1>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/text";
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  h1 {
    @include text.truncate;
    line-height: 20px;
    font-size: 14px;
    margin: 0;
  }

  div {
    max-width: inherit;
  }
</style>
