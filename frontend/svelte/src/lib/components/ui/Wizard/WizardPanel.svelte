<script lang="ts">
  import { fly } from "svelte/transition";
  import { selectedTabStore } from "./wizardStore";

  export let index: number;
  let currentIndex = null;
  const X_SLIDE_OFFSET = 200;
  let slideOffset = X_SLIDE_OFFSET;

  selectedTabStore.subscribe((index) => {
    slideOffset = index > currentIndex ? X_SLIDE_OFFSET : -X_SLIDE_OFFSET;
    currentIndex = index;
  });
</script>

{#if currentIndex === index}
  <div in:fly={{ x: slideOffset, duration: 200 }}>
    <slot />
  </div>
{/if}
