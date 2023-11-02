<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formatNumber, formatPercentage } from "$lib/utils/format.utils";
  import ProposalContentCell from "./ProposalContentCell.svelte";
  import Countdown from "$lib/components/proposals/Countdown.svelte";
  import VotesResultsMajorityDescription from "$lib/components/proposal-detail/VotesResultsMajorityDescription.svelte";
  import { nonNullish } from "@dfinity/utils";

  const formatVotingPower = (value: number) =>
    `${formatNumber(value, {
      minFraction: 0,
      maxFraction: 0,
    })}`;

  export let yes: number;
  export let no: number;
  export let total: number;
  export let deadlineTimestampSeconds: bigint | undefined = undefined;

  let yesProportion: number;
  $: yesProportion = yes / total;

  let noProportion: number;
  $: noProportion = no / total;
</script>

<ProposalContentCell testId="votes-results-component">
  <h2 slot="start" class="title">{$i18n.proposal_detail.voting_results}</h2>

  <div class="votes-info">
    <div class="yes yes-percent">
      <span class="caption">{$i18n.proposal_detail.adopt}</span>
      <span class="percentage" data-tid="adopt-percentage"
        >{formatPercentage(yesProportion)}</span
      >
    </div>
    <div class="remain">
      {#if nonNullish(deadlineTimestampSeconds) && deadlineTimestampSeconds > 0n}
        <span class="caption description"
          >{$i18n.proposal_detail__vote.expiration}</span
        >
        <div class="caption value">
          <Countdown {deadlineTimestampSeconds} />
        </div>
      {/if}
    </div>
    <div class="no no-percent">
      <span class="caption">{$i18n.proposal_detail.reject}</span>
      <span class="percentage" data-tid="reject-percentage"
        >{formatPercentage(noProportion)}</span
      >
    </div>
    <div class="progressbar-container">
      <div class="majority absolute-majority">
        <div class="majority-icon absolute-majority triangle-icon"></div>
      </div>
      <div class="majority simple-majority">
        <div class="majority-icon simple-majority"></div>
      </div>
      <div
        class="progressbar"
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
      <h4 class="description" slot="title">
        <div class="majority-icon absolute-majority"></div>
        {$i18n.proposal_detail__vote.absolute_majority}
      </h4>
      <p class="description">
        {$i18n.proposal_detail__vote.absolute_majority_description}
      </p>
    </VotesResultsMajorityDescription>
    <VotesResultsMajorityDescription>
      <h4 class="description" slot="title">
        <div class="majority-icon simple-majority"></div>
        {$i18n.proposal_detail__vote.simple_majority}
      </h4>
      <p class="description">
        {$i18n.proposal_detail__vote.simple_majority_description}
      </p>
    </VotesResultsMajorityDescription>
  </div>
</ProposalContentCell>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

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
      "progressbar progressbar progressbar progressbar progressbar"
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
    .progressbar-container {
      grid-area: progressbar;
      // to display majorities
      position: relative;
      margin-top: var(--padding-1_5x);
      .majority-icon.simple-majority {
        width: calc(var(--padding) * 0.75);
        height: calc(var(--padding) * 0.75);
      }
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

  .majority-icon {
    width: var(--padding);
    height: var(--padding);
    border-radius: 50%;

    &.absolute-majority {
      background: var(--purple-600);
    }
    &.simple-majority {
      background: var(--orange);
    }
    &.triangle-icon {
      width: 0;
      height: 0;
      border-radius: 0;
      background: none;
      border-left: var(--padding-0_5x) solid transparent;
      border-right: var(--padding-0_5x) solid transparent;
      border-top: var(--padding-0_5x) solid var(--purple-600);
    }
  }

  .majority {
    position: absolute;
    background: var(--card-background);
    width: calc(var(--padding) / 4);
    height: var(--padding-1_5x);

    &.absolute-majority {
      left: 50%;
      transform: translateX(-50%);
    }
    &.simple-majority {
      left: 3%;
      transform: translateX(-50%);
    }

    .majority-icon {
      position: absolute;
      top: calc(-1 * var(--padding-1_5x));
      left: 50%;
      transform: translateX(-50%);
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

  h4 {
    margin: 0;
    display: inline-flex;
    align-items: center;
    column-gap: var(--padding-0_5x);

    @include fonts.standard;
    font-size: $font-size-medium;
  }

  .legends {
    margin-top: var(--padding);
    display: flex;
    flex-direction: column;
    row-gap: var(--padding-0_5x);
  }
</style>
