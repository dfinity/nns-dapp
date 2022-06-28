<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import { onMount, setContext } from "svelte";
  import { AppPath } from "../../constants/routes.constants";
  import Spinner from "../ui/Spinner.svelte";
  import Layout from "../common/Layout.svelte";
  import { routeStore } from "../../stores/route.store";
  import { layoutBackStore, layoutTitleStore } from "../../stores/layout.store";
  import { i18n } from "../../stores/i18n";

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
      case AppPath.SNSLaunchpad:
        return (await import("../../../routes/SNSLaunchpad.svelte")).default;
      case AppPath.SNSProjectDetail:
        return (await import("../../../routes/SNSProjectDetail.svelte"))
          .default;
      default:
        return (await import("../../../routes/Auth.svelte")).default;
    }
  };

  const titleKeys: Record<AppPath, string> = {
    [AppPath.Authentication]: "",
    [AppPath.Accounts]: $i18n.navigation.accounts,
    [AppPath.Neurons]: $i18n.navigation.neurons,
    [AppPath.Proposals]: $i18n.navigation.voting,
    [AppPath.Canisters]: $i18n.navigation.canisters,
    [AppPath.Wallet]: $i18n.wallet.title,
    [AppPath.ProposalDetail]: $i18n.proposal_detail.title,
    [AppPath.NeuronDetail]: $i18n.neuron_detail.title,
    [AppPath.CanisterDetail]: $i18n.canister_detail.title,
    [AppPath.SNSLaunchpad]: $i18n.sns_launchpad.header,
    [AppPath.SNSProjectDetail]: "",
  };

  onMount(async () => {
    layoutTitleStore.set(titleKeys[path]);

    // Reset back action because only detail routes have such feature other views use the menu
    layoutBackStore.set(undefined);

    component = await loadModule();
  });
</script>

<Layout>
  {#if component !== undefined}
    <svelte:component this={component} />
  {:else}
    <section>
      <Spinner />
    </section>
  {/if}
</Layout>

<style lang="scss">
  section {
    position: absolute;
    inset: 0;

    background: var(--background);
    color: rgba(var(--background-contrast-rgb), 0.2);
  }
</style>
