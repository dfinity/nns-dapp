<script lang="ts">
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { HeaderTitle } from "@dfinity/gix-components";
  import { triggerDebugReport } from "$lib/directives/debug.directives";

  export let back: (() => Promise<void>) | undefined = undefined;
</script>

<div use:triggerDebugReport>
  <HeaderTitle>{$layoutTitleStore}</HeaderTitle>
</div>

<style lang="scss">
  div {
    max-width: inherit;
  }
</style>
