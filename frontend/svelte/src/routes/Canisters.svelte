<script lang="ts">
  import Layout from "../lib/components/Layout.svelte";
  import { onMount } from "svelte";
  import { i18n } from "../lib/stores/i18n";
  import SectionWithFooter from "../lib/components/SectionWithFooter.svelte";

  // TODO: To be removed once this page has been implemented
  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      window.location.replace("/#/canisters");
    }
  });

  // TODO: TBD
  const createOrLink = () => alert("Create or Link");
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <Layout>
    <SectionWithFooter>
      <h1>{$i18n.canisters.title}</h1>

      <svelte:fragment slot="footer">
        <button on:click={createOrLink}>{$i18n.canisters.create_or_link}</button
        >
      </svelte:fragment>
    </SectionWithFooter>
  </Layout>
{/if}
