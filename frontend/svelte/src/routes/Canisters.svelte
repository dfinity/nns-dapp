<script lang="ts">
  import Layout from "../lib/components/common/Layout.svelte";
  import { onMount } from "svelte";
  import { i18n } from "../lib/stores/i18n";
  import Toolbar from "../lib/components/ui/Toolbar.svelte";
  import { authStore } from "../lib/stores/auth.store";
  import { toastsStore } from "../lib/stores/toasts.store";
  import { listCanisters } from "../lib/services/canisters.services";
  import { canistersStore } from "../lib/stores/canisters.store";
  import Spinner from "../lib/components/ui/Spinner.svelte";

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

  // TODO: To be removed once this page has been implemented
  const showThisRoute = process.env.REDIRECT_TO_LEGACY === "never";
  onMount(async () => {
    if (!showThisRoute) {
      window.location.replace("/#/canisters");
    }

    await loadCanisters();
  });

  // TODO: TBD https://dfinity.atlassian.net/browse/L2-227
  const createOrLink = () => alert("Create or Link");
</script>

{#if showThisRoute}
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

      <!-- TODO(L2-335): display cards -->
      {#each $canistersStore as canister}
        <p>{canister.name ?? canister.canister_id}</p>
      {/each}

      <!-- TODO(L2-335): message if no canisters -->

      {#if loading}
        <div class="spinner">
          <Spinner />
        </div>
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
