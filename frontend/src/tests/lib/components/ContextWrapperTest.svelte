<script lang="ts">
  import { type Component as ComponentDefinition, setContext } from "svelte";

  export let Component: ComponentDefinition;
  export let contextKey: symbol;
  export let contextValue: unknown;
  export let props: object = {};

  setContext(contextKey, contextValue);
</script>

<svelte:component this={Component} {...props} on:nnsClose />
