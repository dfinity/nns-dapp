<script lang="ts">
  import Layout from "../lib/components/common/Layout.svelte";
  import { onMount } from "svelte";
  import { i18n } from "../lib/stores/i18n";
  import Toolbar from "../lib/components/ui/Toolbar.svelte";
  import { authStore } from "../lib/stores/auth.store";

  // TODO: To be removed once this page has been implemented
  const showThisRoute = process.env.REDIRECT_TO_LEGACY === false;
  onMount(() => {
    if (showThisRoute) {
      window.location.replace("/#/canisters");
    }
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
