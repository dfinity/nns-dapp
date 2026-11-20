<script lang="ts">
  import Backdrop from "$lib/gix/components/Backdrop.svelte";
  import { layoutMenuOpen } from "$lib/gix/stores/layout.store";
</script>

{#if $layoutMenuOpen}
  <Backdrop on:nnsClose={() => layoutMenuOpen.set(false)} />
{/if}
