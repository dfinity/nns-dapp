<script lang="ts">
  import { fly } from "svelte/transition";
  import { selectedStepStore } from "./wizardStore";

  export let index: number;
  let currentIndex: number | null = null;
  let isCurrentIndex: boolean = false;
  const X_SLIDE_OFFSET = 200;
  let slideOffset = X_SLIDE_OFFSET;

  selectedStepStore.subscribe((index) => {
    slideOffset = index > currentIndex ? X_SLIDE_OFFSET : -X_SLIDE_OFFSET;
    currentIndex = index;
  });

  $: isCurrentIndex = index > currentIndex;
</script>

{#if currentIndex === index}
  <div in:fly={{ x: slideOffset, duration: 200 }}>
    <slot />
  </div>
{/if}
