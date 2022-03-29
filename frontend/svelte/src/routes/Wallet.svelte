<script lang="ts">
  import { onMount } from "svelte";
  import { i18n } from "../lib/stores/i18n";
  import Toolbar from "../lib/components/ui/Toolbar.svelte";
  import HeadlessLayout from "../lib/components/common/HeadlessLayout.svelte";
  import { routeStore } from "../lib/stores/route.store";
  import { AppPath } from "../lib/constants/routes.constants";

  // TODO: To be removed once this page has been implemented
  const showThisRoute = ["svelte", "both"].includes(
    process.env.REDIRECT_TO_LEGACY as string
  );
  onMount(() => {
    if (!showThisRoute) {
      window.location.replace(`/${window.location.hash}`);
    }
  });

  const goBack = () => {
    routeStore.navigate({
      path: AppPath.Accounts,
    });
  };

  // TODO: TBD https://dfinity.atlassian.net/browse/L2-225
  const createNewTransaction = () => alert("New Transaction");
</script>

{#if showThisRoute}
  <HeadlessLayout on:nnsBack={goBack}>
    <svelte:fragment slot="header">{$i18n.wallet.title}</svelte:fragment>

    <section>TBD</section>

    <svelte:fragment slot="footer">
      <Toolbar>
        <button class="primary" on:click={createNewTransaction}
          >{$i18n.accounts.new_transaction}</button
        >
      </Toolbar>
    </svelte:fragment>
  </HeadlessLayout>
{/if}

<style lang="scss">
</style>
