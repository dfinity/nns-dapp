<script lang="ts">
  import Layout from "../lib/components/common/Layout.svelte";
  import { onMount } from "svelte";
  import { i18n } from "../lib/stores/i18n";
  import Toolbar from "../lib/components/ui/Toolbar.svelte";
  import { authStore } from "../lib/stores/auth.store";
  import { toastsStore } from "../lib/stores/toasts.store";
  import { listCanisters } from "../lib/services/canisters.services";
  import { canistersStore } from "../lib/stores/canisters.store";
  import { SHOW_CANISTERS_ROUTE } from "../lib/constants/routes.constants";
  import SkeletonCard from "../lib/components/ui/SkeletonCard.svelte";
  import { testCMC } from "../lib/api/canisters.api";

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

  // TODO: TBD https://dfinity.atlassian.net/browse/L2-227
  const createOrLink = () => alert("Create or Link");

  const test = () => {
    testCMC();
  };
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
      <p>
        {$i18n.canisters.principal_is}
        {$authStore.identity?.getPrincipal().toText()}
      </p>
      <button on:click={test}>Test</button>

      <!-- TODO(L2-335): display cards -->
      {#each $canistersStore as canister}
        <p>{canister.name ?? canister.canister_id}</p>
      {/each}

      <!-- TODO(L2-335): message if no canisters -->

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
