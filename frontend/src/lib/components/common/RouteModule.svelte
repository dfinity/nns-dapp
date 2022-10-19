<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import { onMount } from "svelte";
  import { AppPathLegacy } from "$lib/constants/routes.constants";
  import Layout from "./Layout.svelte";
  import { layoutBackStore, layoutTitleStore } from "$lib/stores/layout.store";
  import { i18n } from "$lib/stores/i18n";
  import { isNode } from "$lib/utils/dev.utils";

  export let path: AppPathLegacy;

  let component: typeof SvelteComponent | undefined = undefined;

  const loadModule = async (): Promise<typeof SvelteComponent> => {
    switch (path) {
      case AppPathLegacy.LegacyNeurons:
      case AppPathLegacy.Neurons:
        return (await import("../../routes/Neurons.svelte")).default;
      case AppPathLegacy.Proposals:
        return (await import("../../routes/Proposals.svelte")).default;
      case AppPathLegacy.Canisters:
        return (await import("../../routes/Canisters.svelte")).default;
      case AppPathLegacy.ProposalDetail:
        return (await import("../../routes/ProposalDetail.svelte")).default;
      case AppPathLegacy.LegacyNeuronDetail:
        return (await import("../../routes/LegacyNeuronDetail.svelte")).default;
      case AppPathLegacy.CanisterDetail:
        return (await import("../../routes/CanisterDetail.svelte")).default;
      case AppPathLegacy.Launchpad:
        return (await import("../../routes/Launchpad.svelte")).default;
      case AppPathLegacy.ProjectDetail:
        return (await import("../../routes/ProjectDetail.svelte")).default;
      case AppPathLegacy.NeuronDetail:
        return (await import("../../routes/NeuronDetail.svelte")).default;
    }
  };

  const routesConfig: Record<AppPathLegacy, { title: string }> = {
    [AppPathLegacy.LegacyNeurons]: {
      title: $i18n.navigation.neurons,
    },
    [AppPathLegacy.Neurons]: {
      title: $i18n.navigation.neurons,
    },
    [AppPathLegacy.Proposals]: {
      title: $i18n.navigation.voting,
    },
    [AppPathLegacy.Canisters]: {
      title: $i18n.navigation.canisters,
    },
    [AppPathLegacy.ProposalDetail]: {
      title: $i18n.proposal_detail.title,
    },
    [AppPathLegacy.LegacyNeuronDetail]: {
      title: $i18n.neuron_detail.title,
    },
    [AppPathLegacy.CanisterDetail]: {
      title: $i18n.canister_detail.title,
    },
    [AppPathLegacy.Launchpad]: {
      title: $i18n.sns_launchpad.header,
    },
    [AppPathLegacy.NeuronDetail]: {
      title: $i18n.sns_neuron_detail.header,
    },
    [AppPathLegacy.ProjectDetail]: { title: "" },
  };

  onMount(async () => {
    // TODO(GIX-1071): move to app layout
    layoutTitleStore.set(routesConfig[path].title);

    // TODO(GIX-1071): move to views layout or layout component
    // TODO(GIX-1071): inline layout component?
    // Reset back action because only detail routes have such feature other views use the menu
    layoutBackStore.set(undefined);

    // Lazy loading not supported in jest environment
    if (isNode()) {
      return;
    }

    component = await loadModule();
  });

  let layout: typeof SvelteComponent | undefined = undefined;
  $: layout = Layout;
</script>

<svelte:component this={layout}>
  {#if component !== undefined}
    <svelte:component this={component} />
  {:else}
  {/if}
</svelte:component>

<style lang="scss">
  @use "../../themes/mixins/login";
  @use "@dfinity/gix-components/styles/mixins/display";

  div {
    position: absolute;
    @include display.inset;

    color: rgba(var(--background-contrast-rgb), var(--very-light-opacity));
  }

  .authLayout {
    @include login.background;
  }
</style>
