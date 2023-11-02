<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formatNumber, formatPercentage } from "$lib/utils/format.utils";
  import ProposalContentCell from "./ProposalContentCell.svelte";
  import { nonNullish } from "@dfinity/utils";
  import Countdown from "$lib/components/proposals/Countdown.svelte";
  import VotesResultsMajorityDescription from "$lib/components/proposal-detail/VotesResultsMajorityDescription.svelte";

  const formatVotingPower = (value: number) =>
    `${formatNumber(value, {
      minFraction: 0,
      maxFraction: 0,
    })}`;

  export let yes: number;
  export let no: number;
  export let total: number;
  export let deadlineTimestampSeconds: bigint | undefined;

  let yesProportion: number;
  $: yesProportion = yes / total;

  let noProportion: number;
  $: noProportion = no / total;

  let toggleContent: () => void;
  let expanded: boolean;
</script>

<ProposalContentCell testId="votes-results-component">
  <h2 slot="start" class="title">{$i18n.proposal_detail.voting_results}</h2>

  <div class="votes-info">
    <div class="yes yes-percent">
      <span class="caption">Adopt</span>
      <span class="percentage" data-tid="adopt-percentage"
        >{formatPercentage(yesProportion)}</span
      >
    </div>
    <div class="remain">
      {#if nonNullish(deadlineTimestampSeconds)}
        <span class="caption description">Expiration date</span>
        <div class="caption value">
          <Countdown slot="value" {deadlineTimestampSeconds} />
        </div>
      {/if}
    </div>
    <div class="no no-percent">
      <span class="caption">Reject</span>
      <span class="percentage" data-tid="reject-percentage"
        >{formatPercentage(noProportion)}</span
      >
    </div>
    <div
      class="progressbar"
      role="progressbar"
      data-tid="progressbar"
      aria-label={$i18n.proposal_detail__vote.vote_progress}
      aria-valuenow={yes}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      <div class="yes" style={`width: ${yesProportion * 100}%`}></div>
      <div class="no" style={`width: ${noProportion * 100}%`}></div>
    </div>
    <span class="yes-value yes caption">
      <span class="label description">{`Voting power `}&nbsp;</span>
      <span data-tid="adopt">{formatVotingPower(yes)}</span>
    </span>
    <span class="no-value no caption">
      <span class="label description">{`Voting power`}&nbsp;</span>
      <span data-tid="reject">{formatVotingPower(no)}</span>
    </span>
  </div>

  <div class="legends">
    <VotesResultsMajorityDescription>
      <h4 class="description" slot="title">Absolute Majority</h4>
      <p class="description">
        Before the voting period ends, a proposal is adopted or rejected if an
        absolute majority (more than half of the total voting power, 🚧indicated
        by delimiter above) has voted Yes or No on the proposal, respectively.
      </p>
    </VotesResultsMajorityDescription>
    <VotesResultsMajorityDescription>
      <h4 class="description" slot="title">Simple Majority</h4>
      <p class="description">
        When the voting period ends, a proposal is adopted if a simple majority
        (more than half of the votes cast) has voted Yes and those votes
        constitute at least 3% of the total voting power (indicated by delimiter
        above). Otherwise, the proposal is rejected. Before a proposal is
        decided by Simple Majority, the voting period can be extended in order
        to “wait for quiet”. Such voting period extensions occur when a
        proposal’s voting results turn from either a Yes majority to a No
        majority or vice versa.
      </p>
    </VotesResultsMajorityDescription>
  </div>
</ProposalContentCell>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  // absolute var(--purple-600)
  // simple var(--orange)
  $font-size-medium: 0.875rem;

  .title {
    @include fonts.h3(true);
  }

  .votes-info {
    display: grid;
    margin: var(--padding-2) 0;

    // 5 columns for mobile to give more space for the ".remain" section
    grid-template-areas:
      "yes-percent yes-percent _ no-percent no-percent"
      "progressbar progressbar  progressbar progressbar progressbar"
      "yes-value remain remain remain no-value";
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;

    @include media.min-width(small) {
      grid-template-areas:
        "yes-percent remain no-percent"
        "progressbar progressbar progressbar"
        "yes-value _ no-value";
      grid-template-columns: 1fr 1fr 1fr;
      row-gap: var(--padding-0_5x);
    }
    .yes-percent {
      grid-area: yes-percent;
      display: flex;
      flex-direction: column;
      align-items: start;
    }
    .no-percent {
      grid-area: no-percent;
      display: flex;
      flex-direction: column;
      align-items: end;
    }
    .remain {
      grid-area: remain;
      display: flex;
      flex-direction: column;
      justify-content: center;
      text-align: center;
    }
    .progressbar {
      grid-area: progressbar;
    }
    .yes-value {
      grid-area: yes-value;
      display: flex;
      justify-content: flex-start;
    }
    .no-value {
      grid-area: no-value;
      display: flex;
      justify-content: flex-end;
    }
    // yes-value and no-value mobile/desktop
    .label {
      display: none;
      @include media.min-width(small) {
        display: initial;
      }
    }

    .percentage {
      @include fonts.h2(true);
    }
    .caption {
      @include fonts.small;
    }
    .yes {
      color: var(--positive-emphasis);
    }
    .no {
      color: var(--negative-emphasis);
    }
  }

  .progressbar {
    display: flex;
    // the aria in between is undecided (see the dashboard bar)
    justify-content: space-between;
    height: var(--padding-1_5x);
    margin-bottom: var(--padding-0_5x);
    border-radius: var(--border-radius);
    overflow: hidden;
    background: var(--elements-divider);

    .yes {
      background: var(--positive-emphasis);
    }
    .no {
      background: var(--negative-emphasis);
    }
  }

  .progressbar-values {
    display: flex;
    justify-content: space-between;
  }

  h4 {
    @include fonts.standard;
    font-size: $font-size-medium;
    display: inline;
  }

  .legends {
    margin-top: var(--padding);
    display: flex;
    flex-direction: column;
    row-gap: var(--padding-0_5x);
  }
</style>
