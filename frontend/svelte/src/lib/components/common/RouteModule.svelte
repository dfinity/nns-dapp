<script lang="ts">
  import type { SvelteComponent } from "svelte";
  import { onMount } from "svelte";
  import { AppPath } from "../../constants/routes.constants";

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

  onMount(async () => (component = await loadModule()));
</script>

{#if component !== undefined}
  <svelte:component this={component} />
{/if}
