<script lang="ts">
  import Layout from "../lib/components/common/Layout.svelte";
  import { onMount } from "svelte";
  import { i18n } from "../lib/stores/i18n";
  import Toolbar from "../lib/components/ui/Toolbar.svelte";
  import { authStore } from "../lib/stores/auth.store";
  import { toastsStore } from "../lib/stores/toasts.store";
  import { listCanisters } from "../lib/services/canisters.services";
  import { canistersStore } from "../lib/stores/canisters.store";
  import {
    AppPath,
    SHOW_CANISTERS_ROUTE,
  } from "../lib/constants/routes.constants";
  import SkeletonCard from "../lib/components/ui/SkeletonCard.svelte";
  import CanisterCard from "../lib/components/canisters/CanisterCard.svelte";
  import type { CanisterId } from "../lib/canisters/nns-dapp/nns-dapp.types";
  import { routeStore } from "../lib/stores/route.store";

  let loading: boolean = false;

  const loadCanisters = async () => {
    loading = true;

    try {
      await listCanisters({
        clearBeforeQuery: true,
      });
    } catch (err: unknown) {
      toastsStore.error({
        labelKey: "error.list_canisters",
        err,
      });
    }

    loading = false;
  };

  onMount(async () => {
    if (!SHOW_CANISTERS_ROUTE) {
      window.location.replace("/#/canisters");
    }

    await loadCanisters();
  });

  const goToCanisterDetails = (canisterId: CanisterId) => () => {
    routeStore.navigate({
      path: `${AppPath.CanisterDetail}/${canisterId.toText()}`,
    });
  };

  let noCanisters: boolean;
  $: loading,
    $canistersStore,
    (noCanisters = !loading && $canistersStore.canisters.length === 0);

  // TODO: TBD https://dfinity.atlassian.net/browse/L2-227
  const createOrLink = () => alert("Create or Link");
</script>

{#if SHOW_CANISTERS_ROUTE}
  <Layout>
    <section>
      <p>{$i18n.canisters.text}</p>
      <ul>
        <li>{$i18n.canisters.step1}</li>
        <li>{$i18n.canisters.step2}</li>
        <li>{$i18n.canisters.step3}</li>
      </ul>
      <p class="last-info">
        {$i18n.canisters.principal_is}
        {$authStore.identity?.getPrincipal().toText()}
      </p>

      {#each $canistersStore.canisters as canister}
        <CanisterCard
          role="link"
          ariaLabel={$i18n.neurons.aria_label_neuron_card}
          on:click={goToCanisterDetails(canister.canister_id)}
          {canister}
        />
      {/each}

      {#if noCanisters}
        <p class="no-canisters">{$i18n.canisters.empty}</p>
      {/if}

      {#if loading}
        <SkeletonCard />
        <SkeletonCard />
      {/if}
    </section>

    <svelte:fragment slot="footer">
      <Toolbar>
        <button class="primary" on:click={createOrLink}
          >{$i18n.canisters.create_or_link}</button
        >
      </Toolbar>
    </svelte:fragment>
  </Layout>
{/if}

<style lang="scss">
  .last-info {
    margin-bottom: var(--padding-3x);
  }

  .no-canisters {
    text-align: center;
    margin: var(--padding-2x) 0;
  }
</style>
