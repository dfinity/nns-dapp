<script lang="ts">
  import { onMount, SvelteComponent } from "svelte";
  import Layout from "../lib/components/common/Layout.svelte";
  import Spinner from "../lib/components/ui/Spinner.svelte";
  import { IS_TESTNET } from "../lib/constants/environment.constants";
  import { AppPath } from "../lib/constants/routes.constants";
  import { i18n } from "../lib/stores/i18n";
  import { routeStore } from "../lib/stores/route.store";

  let pageContent: typeof SvelteComponent | undefined;

  const importPageContent = async () => {
    pageContent = (
      await import("../lib/components/sns-launchpad/SNSLaunchpadContent.svelte")
    ).default;
  };

  onMount(() => {
    if (!IS_TESTNET) {
      routeStore.replace({ path: AppPath.Accounts });
      return;
    }

    importPageContent();
  });
</script>

<Layout>
  <svelte:fragment slot="header">{$i18n.sns_launchpad.header}</svelte:fragment>

  {#if pageContent === undefined}
    <Spinner />
  {:else}
    <svelte:component this={pageContent} />
  {/if}
</Layout>
