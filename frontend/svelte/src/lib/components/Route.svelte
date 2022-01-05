<script lang="ts">
  import { SvelteComponent } from "svelte";
  import { routePath } from "../utils/route.utils";

  export let path: string;
  export let component: SvelteComponent;

  let currentPath: string = routePath();
</script>

<svelte:window on:hashchange={() => (currentPath = routePath())} />

{#if path === currentPath}
  <svelte:component this={component} />
{/if}
