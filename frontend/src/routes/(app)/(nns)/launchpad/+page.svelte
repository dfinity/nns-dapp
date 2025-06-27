<script lang="ts">
  import Launchpad from "$lib/pages/Launchpad.svelte";
  import { ENABLE_LAUNCHPAD_REDESIGN } from "$lib/stores/feature-flags.store";
  import Launchpad2 from "$lib/pages/Launchpad2.svelte";
</script>

{#if $ENABLE_LAUNCHPAD_REDESIGN}
  <Launchpad2 />
{:else}
  <Launchpad />
{/if}
