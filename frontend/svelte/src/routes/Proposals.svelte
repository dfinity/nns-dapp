<script lang="ts">
  import Layout from "../lib/components/Layout.svelte";
  import { onMount } from "svelte";
  import { i18n } from "../lib/stores/i18n";

  // TODO: To be removed once this page has been implemented
  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      window.location.replace("/#/proposals");
    }
  });
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <Layout>
    <section>
      <h1>{$i18n.navigation.voting}</h1>
    </section>
  </Layout>
{/if}
