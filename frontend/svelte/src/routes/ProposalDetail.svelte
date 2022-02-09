<script lang="ts">
  import { onMount } from "svelte";
  import IsolatedPageLayout from "../lib/components/common/IsolatedPageLayout.svelte";

  // TODO: To be removed once this page has been implemented
  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      // TODO: TBD
      window.location.replace(`/${window.location.hash}`);
    }
  });
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <IsolatedPageLayout>
    <svelte:fragment slot="header">Proposal</svelte:fragment>

    <section>TBD</section>

    <svelte:fragment slot="footer" />
  </IsolatedPageLayout>
{/if}

<style lang="scss">
</style>
