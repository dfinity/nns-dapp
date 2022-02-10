<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import IsolatedPageLayout from "../lib/components/common/IsolatedPageLayout.svelte";
  import { routeStore } from "../lib/stores/route.store";
  import { AppPath } from "./routes";

  // TODO: To be removed once this page has been implemented
  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      // TODO: TBD
      window.location.replace(`/${window.location.hash}`);
    }
  });

  let previousPath: string = null;

  const unsubscribe = routeStore.subscribe(
    (state) => (previousPath = state.previousPath)
  );

  onDestroy(unsubscribe);

  const goBack = () => {
    if (previousPath === AppPath.Proposals) {
      routeStore.back();
    } else {
      routeStore.navigate({
        path: AppPath.Proposals,
      });
    }
  };
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <IsolatedPageLayout on:nnsBack={goBack}>
    <svelte:fragment slot="header">Proposal</svelte:fragment>

    <section>TBD</section>

    <svelte:fragment slot="footer" />
  </IsolatedPageLayout>
{/if}

<style lang="scss">
</style>
