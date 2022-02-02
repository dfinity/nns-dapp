<script lang="ts">
  import Layout from "../lib/components/Layout.svelte";
  import { onMount } from "svelte";
  import { i18n } from "../lib/stores/i18n";
import Footer from "../lib/components/Footer.svelte";

  // TODO: To be removed once this page has been implemented
  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      window.location.replace("/#/canisters");
    }
  });

  // TODO: TBD add Story Number Here
  const createOrLink = () => alert('Create or Link');
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <Layout>
    <section>
      <h1>{$i18n.navigation.canisters}</h1>

      <Footer>
        <button
          on:click={createOrLink}
        >Create or Link</button>
      </Footer>
    </section>
  </Layout>
{/if}
