<script lang="ts">
  import { onMount } from "svelte";

  import HeadlessLayout from "../lib/components/common/HeadlessLayout.svelte";
  import NeuronFollowingCard from "../lib/components/neuron-detail/NeuronFollowingCard.svelte";
  import NeuronHotkeysCard from "../lib/components/neuron-detail/NeuronHotkeysCard.svelte";
  import NeuronMaturityCard from "../lib/components/neuron-detail/NeuronMaturityCard.svelte";
  import NeuronMetaInfoCard from "../lib/components/neuron-detail/NeuronMetaInfoCard.svelte";
  import NeuronProposalsCard from "../lib/components/neuron-detail/NeuronProposalsCard.svelte";
  import NeuronVotingHistoryCard from "../lib/components/neuron-detail/NeuronVotingHistoryCard.svelte";
  import { i18n } from "../lib/stores/i18n";

  // TODO: To be removed once this page has been implemented
  const showThisRoute = ["never", "staging"].includes(
    process.env.REDIRECT_TO_LEGACY as string
  );
  onMount(async () => {
    if (!showThisRoute) {
      window.location.replace(`/${window.location.hash}`);
      return;
    }
  });
</script>

{#if showThisRoute}
  <HeadlessLayout>
    <svelte:fragment slot="header">{$i18n.neuron_detail.title}</svelte:fragment>
    <section>
      <NeuronMetaInfoCard />
      <NeuronMaturityCard />
      <NeuronFollowingCard />
      <NeuronProposalsCard />
      <NeuronHotkeysCard />
      <NeuronVotingHistoryCard />
    </section>
  </HeadlessLayout>
{/if}
