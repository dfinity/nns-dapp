<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import { onMount, setContext } from "svelte";
  import { AppPath } from "../../constants/routes.constants";
  import Spinner from "../ui/Spinner.svelte";
  import Layout from "../common/Layout.svelte";
  import {routeStore} from "../../stores/route.store";
  import {layoutTitleStore} from '../../stores/layout.store';
  import {i18n} from '../../stores/i18n';

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
    [AppPath.Authentication]: '',
    [AppPath.Accounts]: $i18n.navigation.accounts,
    [AppPath.Neurons]: '../../../routes/Neurons.svelte',
    [AppPath.Proposals]: '../../../routes/Proposals.svelte',
    [AppPath.Canisters]: '../../../routes/Canisters.svelte',
    [AppPath.Wallet]: $i18n.wallet.title,
    [AppPath.ProposalDetail]: '../../../routes/ProposalDetail.svelte',
    [AppPath.NeuronDetail]: '../../../routes/NeuronDetail.svelte',
    [AppPath.CanisterDetail]: '../../../routes/CanisterDetail.svelte',
    [AppPath.SNSLaunchpad]: '../../../routes/SNSLaunchpad.svelte',
    [AppPath.SNSProjectDetail]: '../../../routes/SNSProjectDetail.svelte',
  }

  onMount(async () => {
    layoutTitleStore.set(titleKeys[path]);

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
