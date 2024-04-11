<script lang="ts">
  import { scale } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { onMount } from "svelte";

  export let count: number;

  // Always rerender to trigger animation start
  let mounted = false;
  onMount(() => (mounted = true));
</script>

{#if mounted}
  <span
    transition:scale={{
      duration: 250,
      easing: cubicOut,
    }}
    data-tid="actionable-proposal-count-badge-component"
    class="tag">{count}</span
  >
{/if}

<style lang="scss">
  span {
    background: var(--primary);
    color: var(--primary-contrast);
    border-radius: var(--padding-8x);
  }
</style>
