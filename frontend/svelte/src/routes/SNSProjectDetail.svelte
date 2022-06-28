<script lang="ts">
  import { onMount, SvelteComponent } from "svelte";
  import Layout from "../lib/components/common/Layout.svelte";
  import Spinner from "../lib/components/ui/Spinner.svelte";
  import { IS_TESTNET } from "../lib/constants/environment.constants";
  import { AppPath } from "../lib/constants/routes.constants";
  import { routeStore } from "../lib/stores/route.store";

  let pageContent: typeof SvelteComponent | undefined;

  const importPageContent = async () => {
    pageContent = await (
      await import(
        "../lib/components/sns-project-detail/SNSProjectDetailContent.svelte"
      )
    ).default;
  };

  onMount(() => {
    if (!IS_TESTNET) {
      routeStore.replace({ path: AppPath.Accounts });
      return;
    }

    importPageContent();
  });

  const goBack = () =>
    routeStore.navigate({
      path: AppPath.SNSLaunchpad,
    });
</script>

<Layout on:nnsBack={goBack} layout="detail">
  <svelte:fragment slot="header">Project Tetris</svelte:fragment>

  {#if pageContent === undefined}
    <Spinner />
  {:else}
    <svelte:component this={pageContent} />
  {/if}
</Layout>
