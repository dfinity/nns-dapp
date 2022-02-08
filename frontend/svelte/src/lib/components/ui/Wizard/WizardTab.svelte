<script lang="ts">
  import { fly } from 'svelte/transition';
  import { selectedTabStore } from "./wizardStore";

  export let index: number;
  let currentIndex = null;

  selectedTabStore.subscribe((index) => {
    currentIndex = index;
  });
</script>

{#if currentIndex === index}
  <div in:fly="{{ x: 200, duration: 200 }}">
    <slot />
  </div>
{/if}