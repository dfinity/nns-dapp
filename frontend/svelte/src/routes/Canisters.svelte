<script lang="ts">
  import Layout from "../lib/components/Layout.svelte";
  import { onMount } from "svelte";
  import { i18n } from "../lib/stores/i18n";
  import SectionWithToolbar from "../lib/components/SectionWithToolbar.svelte";

  // TODO: To be removed once this page has been implemented
  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      window.location.replace("/#/canisters");
    }
  });

  // TODO: TBD https://dfinity.atlassian.net/browse/L2-227
  const createOrLink = () => alert("Create or Link");
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <Layout>
    <SectionWithToolbar>
      <h1>{$i18n.canisters.title}</h1>

      <svelte:fragment slot="toolbar">
        <button on:click={createOrLink}>{$i18n.canisters.create_or_link}</button
        >
      </svelte:fragment>
    </SectionWithToolbar>
  </Layout>
{/if}
