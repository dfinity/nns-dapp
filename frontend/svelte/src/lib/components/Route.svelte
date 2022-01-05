<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import { routePath } from "../utils/route.utils";

  export let path: string;
  export let component: new (...args: any[]) => SvelteComponent;

  let currentPath: string = routePath();
</script>

<svelte:window on:hashchange={() => (currentPath = routePath())} />

{#if path === currentPath}
  <svelte:component this={component} />
{/if}
