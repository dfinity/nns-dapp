<script lang="ts">
  import type { BallotInfo, NeuronInfo } from "@dfinity/nns";
  import Card from "../ui/Card.svelte";
  import { i18n } from "../../stores/i18n";
  import BallotSummary from "../proposals/BallotSummary.svelte";

  export let neuron: NeuronInfo;

  let ballots: Required<BallotInfo>[];

  const distinctBallots = ({
    recentBallots,
  }: NeuronInfo): Required<BallotInfo>[] =>
    Array.from(
      new Set(
        recentBallots.filter(
          ({ proposalId }: BallotInfo) => proposalId !== undefined
        )
      )
    );

  $: ballots = distinctBallots(neuron);
</script>

<Card>
  <h3 slot="start">{$i18n.neuron_detail.voting_history}</h3>

  <div class="history">
    <h4>{$i18n.proposal_detail.summary}</h4>
    <h4 class="vote">{$i18n.neuron_detail.vote}</h4>

    {#each ballots as ballot}
      <BallotSummary {ballot} />
    {/each}
  </div>
</Card>

<style lang="scss">
  .history {
    display: grid;
    grid-template-columns: 80% auto;
    grid-column-gap: var(--padding);
  }

  .vote {
    justify-self: flex-end;
  }
</style>
