<script lang="ts">
  import { onMount } from "svelte";
  import { i18n } from "../lib/stores/i18n";
  import Toolbar from "../lib/components/ui/Toolbar.svelte";
  import IsolatedPageLayout from "../lib/components/common/IsolatedPageLayout.svelte";

  // TODO: To be removed once this page has been implemented
  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      // TODO: TBD
      window.location.replace(`/${window.location.hash}`);
    }
  });

  // TODO: TBD https://dfinity.atlassian.net/browse/L2-225
  const createNewTransaction = () => alert("New Transaction");
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <IsolatedPageLayout>
    <svelte:fragment slot="header">Account</svelte:fragment>

    <section>TBD</section>

    <svelte:fragment slot="footer">
      <Toolbar>
        <button class="primary" on:click={createNewTransaction}
          >{$i18n.accounts.new_transaction}</button
        >
      </Toolbar>
    </svelte:fragment>
  </IsolatedPageLayout>
{/if}

<style lang="scss">
</style>
