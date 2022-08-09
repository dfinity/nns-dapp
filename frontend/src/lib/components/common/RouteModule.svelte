<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import { onMount } from "svelte";
  import { AppPath } from "../../constants/routes.constants";
  import Spinner from "../ui/Spinner.svelte";
  import Layout from "./Layout.svelte";
  import AuthLayout from "./AuthLayout.svelte";
  import {
    layoutBackStore,
    layoutMainStyleStore,
    layoutTitleStore,
  } from "../../stores/layout.store";
  import { i18n } from "../../stores/i18n";
  import { isNode } from "../../utils/dev.utils";

  export let path: AppPath;

  let component: typeof SvelteComponent | undefined = undefined;

  const loadModule = async (): Promise<typeof SvelteComponent> => {
    switch (path) {
      case AppPath.Accounts:
        return (await import("../../../routes/Accounts.svelte")).default;
      case AppPath.Neurons:
        return (await import("../../../routes/Neurons.svelte")).default;
      case AppPath.Proposals:
        return (await import("../../../routes/Proposals.svelte")).default;
      case AppPath.Canisters:
        return (await import("../../../routes/Canisters.svelte")).default;
      case AppPath.Wallet:
        return (await import("../../../routes/Wallet.svelte")).default;
      case AppPath.ProposalDetail:
        return (await import("../../../routes/ProposalDetail.svelte")).default;
      case AppPath.NeuronDetail:
        return (await import("../../../routes/NeuronDetail.svelte")).default;
      case AppPath.CanisterDetail:
        return (await import("../../../routes/CanisterDetail.svelte")).default;
      case AppPath.Launchpad:
        return (await import("../../../routes/Launchpad.svelte")).default;
      case AppPath.ProjectDetail:
        return (await import("../../../routes/ProjectDetail.svelte")).default;
      case AppPath.SnsNeuronDetail:
        return (await import("../../../routes/SnsNeuronDetail.svelte")).default;
      default:
        return (await import("../../../routes/Auth.svelte")).default;
    }
  };

  const routesConfig: Record<
    AppPath,
    { title: string; layout: "modern" | "deprecated" | undefined }
  > = {
    [AppPath.Authentication]: {
      title: "",
      layout: undefined,
    },
    [AppPath.Accounts]: {
      title: $i18n.navigation.accounts,
      layout: "deprecated",
    },
    [AppPath.Neurons]: {
      title: $i18n.navigation.neurons,
      layout: "deprecated",
    },
    [AppPath.Proposals]: {
      title: $i18n.navigation.voting,
      layout: "deprecated",
    },
    [AppPath.Canisters]: {
      title: $i18n.navigation.canisters,
      layout: "deprecated",
    },
    [AppPath.Wallet]: { title: $i18n.wallet.title, layout: "deprecated" },
    [AppPath.ProposalDetail]: {
      title: $i18n.proposal_detail.title,
      layout: "deprecated",
    },
    [AppPath.NeuronDetail]: {
      title: $i18n.neuron_detail.title,
      layout: "deprecated",
    },
    [AppPath.CanisterDetail]: {
      title: $i18n.canister_detail.title,
      layout: "deprecated",
    },
    [AppPath.Launchpad]: {
      title: $i18n.sns_launchpad.header,
      layout: "modern",
    },
    [AppPath.SnsNeuronDetail]: {
      title: $i18n.sns_neuron_detail.header,
      layout: "modern",
    },
    [AppPath.ProjectDetail]: { title: "", layout: "modern" },
  };

  onMount(async () => {
    layoutTitleStore.set(routesConfig[path].title);
    layoutMainStyleStore.set(routesConfig[path].layout);

    // Reset back action because only detail routes have such feature other views use the menu
    layoutBackStore.set(undefined);

    // Lazy loading not supported in jest environment
    if (isNode()) {
      return;
    }

    component = await loadModule();
  });

  let authLayout: boolean = true;
  $: authLayout = path === AppPath.Authentication;

  let layout: typeof SvelteComponent | undefined = undefined;
  $: layout = authLayout ? AuthLayout : Layout;
</script>

<svelte:component this={layout}>
  {#if component !== undefined}
    <svelte:component this={component} />
  {:else}
    <section class:authLayout>
      <Spinner />
    </section>
  {/if}
</svelte:component>

<style lang="scss">
  @use "../../themes/mixins/display";

  section {
    position: absolute;
    @include display.inset;

    color: rgba(var(--background-contrast-rgb), var(--very-light-opacity));
  }

  .authLayout {
    // Fancy color based on the milky way of the auth background image
    color: rgba(112, 71, 224, 0.6);
  }
</style>
