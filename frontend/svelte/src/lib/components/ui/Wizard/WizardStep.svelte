<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  import { fly } from "svelte/transition";
  import { selectedStepStore } from "./wizardStore";

  export let index: number;
  const DEFAULT_OFFSET = 200;
  const ANIMATION_DURATION = 200;
  let currentIndex: number | null = null;
  let isCurrentIndex: boolean = false;
  let container: HTMLDivElement | undefined;
  let absolutOffset = 200;
  let slideOffset: number | undefined;

  const unsubscribe = selectedStepStore.subscribe((index) => {
    slideOffset = index > currentIndex ? absolutOffset : -absolutOffset;
    currentIndex = index;
  });

  onDestroy(unsubscribe);

  $: absolutOffset = container ? container.clientWidth : DEFAULT_OFFSET;
  $: isCurrentIndex = index === currentIndex;
</script>

{#if isCurrentIndex}
  <div
    bind:this={container}
    in:fly={{ x: slideOffset, duration: ANIMATION_DURATION }}
  >
    <slot />
  </div>
{/if}
