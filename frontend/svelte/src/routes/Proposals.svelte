<script lang="ts">
  import Layout from "../lib/components/Layout.svelte";
  import { onMount } from "svelte";
  import VotingFilters from "../lib/components/VotingFilters.svelte";
  import { i18n } from "../lib/stores/i18n";
  import SectionWithToolbar from "../lib/components/SectionWithToolbar.svelte";

  // TODO: To be removed once this page has been implemented
  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      window.location.replace("/#/proposals");
    }
  });
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <Layout>
    <SectionWithToolbar>
      <h1>{$i18n.voting.title}</h1>

      <p>{$i18n.voting.text}</p>

      <VotingFilters />

      <!-- TODO(#L2-206): list proposals and use filters -->
    </SectionWithToolbar>
  </Layout>
{/if}
