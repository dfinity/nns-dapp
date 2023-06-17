<script lang="ts">
  import { setContext, SvelteComponent } from "svelte";

  export let Component: SvelteComponent;
  export let contextKey: symbol;
  export let contextValue: unknown;
  export let props: object = {};

  setContext(contextKey, contextValue);
</script>

<svelte:component this={Component} {...props} on:nnsClose />
