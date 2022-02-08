<script lang="ts">
  import { onDestroy } from "svelte";

  import { fly } from "svelte/transition";
  import { selectedStepStore } from "./wizardStore";

  export let index: number;
  let currentIndex: number | null = null;
  let isCurrentIndex: boolean = false;
  const X_SLIDE_OFFSET = 200;
  let slideOffset: number | undefined;

  const unsubscribe = selectedStepStore.subscribe((index) => {
    slideOffset = index > currentIndex ? X_SLIDE_OFFSET : -X_SLIDE_OFFSET;
    currentIndex = index;
  });

  onDestroy(unsubscribe);

  $: isCurrentIndex = index === currentIndex;
</script>

{#if isCurrentIndex}
  <div in:fly={{ x: slideOffset, duration: 200 }}>
    <slot />
  </div>
{/if}
