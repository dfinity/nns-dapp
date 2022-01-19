<script lang="ts">
  import Layout from "../lib/components/Layout.svelte";
  import { onMount } from "svelte";
  import Filter from "../lib/components/Filter.svelte";
  import {Topics} from "../lib/constants/topics";
  import {Rewards} from "../lib/constants/rewards";
  import {Proposals} from "../lib/constants/proposals";

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

      <Filter filters={Object.values(Topics)}>Topics</Filter>

      <div class="status">
        <Filter filters={Object.values(Rewards)}>Reward Status</Filter>

        <Filter filters={Object.values(Proposals)}>Proposal Status</Filter>
      </div>
    </section>
  </Layout>
{/if}

<style lang="scss">
  .status {
    display: grid;
    width: calc(100% - var(--padding));
    grid-template-columns: repeat(2, 50%);
    grid-column-gap: var(--padding);

    @media (max-width: 768px) {
      display: block;
    }
  }
</style>
