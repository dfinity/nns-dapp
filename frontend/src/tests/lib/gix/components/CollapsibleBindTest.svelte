<script lang="ts">
  import Collapsible from "$lib/gix/components/Collapsible.svelte";

  let expanded = $state(false);
</script>

<button data-tid="parent-toggle" onclick={() => (expanded = !expanded)}>
  Toggle
</button>

<Collapsible bind:expanded>
  {#snippet header()}Jack{/snippet}
  Sparrow
</Collapsible>
