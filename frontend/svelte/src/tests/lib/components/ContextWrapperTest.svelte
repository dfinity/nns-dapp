<script lang="ts">
  import { setContext, SvelteComponent } from "svelte";

  export let Component: SvelteComponent;
  export let contextKey: string;
  export let contextValue: unknown;

  setContext(contextKey, contextValue);
</script>

<svelte:component this={Component} />
