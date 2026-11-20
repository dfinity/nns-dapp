<script lang="ts">
  import type { Component } from "svelte";

  export let cmp: Component;
  export let testId: string;
</script>

<svelte:component this={cmp}>
  <p data-tid={testId}>TEST TITLE</p>
</svelte:component>
