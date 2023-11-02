<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formatNumber, formatPercentage } from "$lib/utils/format.utils";
  import ProposalContentCell from "./ProposalContentCell.svelte";
  import { nonNullish } from "@dfinity/utils";
  import Countdown from "$lib/components/proposals/Countdown.svelte";

  const formatVotingPower = (value: number) =>
    // TODO(max): i18n
    `${"Voting power"} ${formatNumber(value, {
      minFraction: 3,
      maxFraction: 3,
    })}`;

  export let yes: number;
  export let no: number;
  export let total: number;
  export let deadlineTimestampSeconds: bigint | undefined;

  let yesProportion: number;
  $: yesProportion = yes / total;

  let noProportion: number;
  $: noProportion = no / total;

  let undecidedPercent: number;
  $: undecidedPercent = 100 - yesProportion - noProportion;
</script>

<ProposalContentCell testId="votes-results-component">
  <h2 slot="start" class="title">{$i18n.proposal_detail.voting_results}</h2>

  <div class="votes-info">
    <div class="yes">
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
    <div class="no">
      <span class="caption">Reject</span>
      <span class="percentage" data-tid="reject-percentage"
        >{formatPercentage(noProportion)}</span
      >
    </div>
  </div>

  <div
    class="votes-progressbar"
    role="progressbar"
    data-tid="votes-progressbar"
    aria-label={$i18n.proposal_detail__vote.vote_progress}
    aria-valuenow={yes}
    aria-valuemin={0}
    aria-valuemax={total}
  >
    <div class="yes" style={`width: ${yesProportion * 100}%`}></div>
    <div class="no" style={`width: ${noProportion * 100}%`}></div>
  </div>
  <div class="progressbar-values description">
    <span class="caption" data-tid="adopt">{formatVotingPower(yes)}</span>
    <span class="caption" data-tid="reject">{formatVotingPower(no)}</span>
  </div>
</ProposalContentCell>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .caption {
    @include fonts.small;
  }
  .yes {
    color: var(--positive-emphasis);
  }
  .no {
    color: var(--negative-emphasis);
  }
  .votes-info {
    display: grid;
    column-gap: var(--padding-1_5x);
    row-gap: var(--padding);
    align-items: center;
    grid-template-columns: 1fr 1fr;
    grid-template-areas:
      "yes no"
      "remain remain";

    @include media.min-width(small) {
      grid-template-areas: "yes remain no";
      grid-template-columns: 1fr auto 1fr;
    }

    .yes {
      grid-area: yes;
      display: flex;
      flex-direction: column;
      align-items: start;
    }
    .remain {
      grid-area: remain;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .no {
      grid-area: no;
      display: flex;
      flex-direction: column;
      align-items: end;
    }

    .percentage {
      @include fonts.h2(true);
    }
  }

  .votes-progressbar {
    display: flex;
    // the aria in between is undecided (see the dashboard bar)
    justify-content: space-between;
    height: var(--padding-1_5x);
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

  .title {
    padding-bottom: var(--padding);
  }
</style>
