<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { toggleAlfred } from "$lib/stores/alfred";

  // Handle keyboard shortcuts
  const handleKeydown = (event: KeyboardEvent) => {
    // Check for Cmd+K or Ctrl+K
    if ((event.metaKey || event.ctrlKey) && event.key === "k") {
      event.preventDefault();
      toggleAlfred();
    }
  };

  onMount(() => {
    document.addEventListener("keydown", handleKeydown);
  });

  onDestroy(() => {
    document.removeEventListener("keydown", handleKeydown);
  });
</script> 