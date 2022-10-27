<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import { onMount } from "svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { Spinner } from "@dfinity/gix-components";

  export let path: AppPath;
  export let params: Record<string, string | undefined | null> | undefined =
    undefined;

  let component: typeof SvelteComponent | undefined = undefined;

  const loadModule = async (): Promise<typeof SvelteComponent> => {
    switch (path) {
      case AppPath.Accounts:
        return (await import("../../routes/Accounts.svelte")).default;
      case AppPath.Neurons:
        return (await import("../../routes/Neurons.svelte")).default;
      case AppPath.Proposals:
        return (await import("../../pages/Proposals.svelte")).default;
      case AppPath.Canisters:
        return (await import("../../pages/Canisters.svelte")).default;
      case AppPath.Wallet:
        return (await import("../../routes/Wallet.svelte")).default;
      case AppPath.Proposal:
        return (await import("../../pages/ProposalDetail.svelte")).default;
      case AppPath.Canister:
        return (await import("../../pages/CanisterDetail.svelte")).default;
      case AppPath.Launchpad:
        return (await import("../../pages/Launchpad.svelte")).default;
      case AppPath.Project:
        return (await import("../../pages/ProjectDetail.svelte")).default;
      case AppPath.Neuron:
        return (await import("../../routes/NeuronDetail.svelte")).default;
      default:
        return (await import("../../pages/Auth.svelte")).default;
    }
  };

  let spinner = false;

  onMount(async () => {
    // We defer the display of the spinner to avoid brief glitch when pages chunks are loaded quickly
    setTimeout(() => (spinner = true), 250);

    component = await loadModule();
  });
</script>

{#if component !== undefined}
  <svelte:component this={component} {...params ?? {}} />
{:else}
  <div class:hidden={!spinner}>
    <Spinner />
  </div>
{/if}

<style lang="scss">
  div {
    opacity: 1;
    visibility: visible;

    transition: opacity ease-out var(--animation-time-short);
  }

  .hidden {
    opacity: 0;
    visibility: hidden;
  }
</style>
