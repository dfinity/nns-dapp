<script lang="ts">
  import { page } from "$app/stores";
  import { AppPath } from "$lib/constants/routes.constants";
  import { pathForRouteId } from "$lib/utils/page.utils";
  import type { SvelteComponent } from "svelte";

  export let testComponent: typeof SvelteComponent;
  export let accountIdentifier: string | undefined = undefined;
  let currentAppPath: string | undefined = undefined;
  $: currentAppPath = pathForRouteId($page.route.id);
</script>

{#if currentAppPath === AppPath.Wallet}
  <svelte:component this={testComponent} {accountIdentifier} />
{/if}
