<script lang="ts">
  import { onMount } from "svelte";
  import HeadlessLayout from "../lib/components/common/HeadlessLayout.svelte";
  import { AppPath } from "../lib/constants/routes.constants";
  import { routeStore } from "../lib/stores/route.store";

  // TODO: To be removed once this page has been implemented
  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      // TODO: TBD
      window.location.replace(`/${window.location.hash}`);
    }
  });

  const goBack = () => {
    routeStore.navigate({
      path: AppPath.Proposals,
    });
  };
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <HeadlessLayout on:nnsBack={goBack}>
    <svelte:fragment slot="header">Proposal</svelte:fragment>

    <section>TBD</section>

    <svelte:fragment slot="footer" />
  </HeadlessLayout>
{/if}

<style lang="scss">
</style>
