<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { i18n } from "../lib/stores/i18n";
  import Toolbar from "../lib/components/ui/Toolbar.svelte";
  import IsolatedPageLayout from "../lib/components/common/IsolatedPageLayout.svelte";
  import { AppPath } from "./routes";
  import { routeStore } from "../lib/stores/route.store";

  // TODO: To be removed once this page has been implemented
  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      window.location.replace(`/${window.location.hash}`);
    }
  });

  let previousPath: string = null;

  const unsubscribe = routeStore.subscribe(
    (state) => (previousPath = state.previousPath)
  );

  onDestroy(unsubscribe);

  const goBack = () => {
    if (previousPath === AppPath.Accounts) {
      routeStore.back();
    } else {
      routeStore.navigate({
        path: AppPath.Accounts,
      });
    }
  };

  // TODO: TBD https://dfinity.atlassian.net/browse/L2-225
  const createNewTransaction = () => alert("New Transaction");
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <IsolatedPageLayout on:nnsBack={goBack}>
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
