<script lang="ts">
  import Layout from "../lib/components/Layout.svelte";
  import { onMount } from "svelte";
  import VotingFilters from "../lib/components/VotingFilters.svelte";

  // TODO: To be removed once this page has been implemented
  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      window.location.replace("/#/voting");
    }
  });
</script>

{#if !process.env.REDIRECT_TO_LEGACY}
  <Layout>
    <section>
      <h1>Voting</h1>

      <p>
        The Internet Computer network runs under the control of the Network
        Nervous System, which adopts proposals and automatically executes
        corresponding actions. Anyone can submit a proposal, which are decided
        as the result of voting activity by neurons.
      </p>

      <VotingFilters />
    </section>
  </Layout>
{/if}
