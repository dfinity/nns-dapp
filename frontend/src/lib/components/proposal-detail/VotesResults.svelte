<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { formatNumber, formatPercentage } from "$lib/utils/format.utils";
  import ProposalContentCell from "./ProposalContentCell.svelte";
  import Countdown from "$lib/components/proposals/Countdown.svelte";
  import VotesResultsMajorityDescription from "$lib/components/proposal-detail/VotesResultsMajorityDescription.svelte";
  import { nonNullish } from "@dfinity/utils";
  import { nowInSeconds } from "$lib/utils/date.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { isSuperMajority } from "$lib/utils/sns-proposals.utils";
  import { Html } from "@dfinity/gix-components";

  const formatVotingPower = (value: number) =>
    `${formatNumber(value, {
      minFraction: 0,
      maxFraction: 0,
    })}`;
  const formatPercent = (value: number) =>
    `${formatPercentage(value / 100, {
      minFraction: 0,
      maxFraction: 2,
    })}`;
  const immediateMajorityIcon = `<span class="inline-maturity-icon immediate-majority"></span>`;
  const standardMajorityIcon = `<span class="inline-maturity-icon standard-majority"></span>`;
  const iconifyDescription = (description: string) =>
    description
      .replace(/\$icon_immediate_majority/g, immediateMajorityIcon)
      .replace(/\$icon_standard_majority/g, standardMajorityIcon);

  export let yes: number;
  export let no: number;
  export let total: number;
  export let deadlineTimestampSeconds: bigint | undefined = undefined;
  export let immediateMajorityPercent: number;
  export let standardMajorityPercent: number;

  let yesProportion: number;
  $: yesProportion = total ? yes / total : 0;

  let noProportion: number;
  $: noProportion = total ? no / total : 0;

  let yesNoSum: number;
  $: yesNoSum = yes + no;
  let castVotesYes: number;
  $: castVotesYes = yesNoSum > 0 ? (yes / yesNoSum) * 100 : 0;
  let castVotesNo: number;
  $: castVotesNo = yesNoSum > 0 ? (no / yesNoSum) * 100 : 0;

  let showExpirationDate: boolean = true;
  $: showExpirationDate =
    nonNullish(deadlineTimestampSeconds) &&
    deadlineTimestampSeconds > BigInt(nowInSeconds());

  // TODO(max): refactor to "isCritical", isSuperMajority -> isCriticalProposal
  let superMajorityMode: boolean;
  $: superMajorityMode = isSuperMajority(immediateMajorityPercent);

  let immediateMajorityTitle: string;
  $: immediateMajorityTitle = superMajorityMode
    ? $i18n.proposal_detail__vote.immediate_super_majority
    : $i18n.proposal_detail__vote.immediate_majority;

  let immediateMajorityDescription: string;
  $: immediateMajorityDescription = superMajorityMode
    ? replacePlaceholders(
        $i18n.proposal_detail__vote.immediate_super_majority_description,
        {
          $immediate_majority: formatPercent(immediateMajorityPercent),
          $no_immediate_majority: formatPercent(100 - immediateMajorityPercent),
        }
      )
    : $i18n.proposal_detail__vote.immediate_majority_description;

  let standardMajorityTitle: string;
  $: standardMajorityTitle = superMajorityMode
    ? $i18n.proposal_detail__vote.standard_super_majority
    : $i18n.proposal_detail__vote.standard_majority;

  let standardMajorityDescription: string;
  $: standardMajorityDescription = replacePlaceholders(
    superMajorityMode
      ? $i18n.proposal_detail__vote.standard_super_majority_description
      : $i18n.proposal_detail__vote.standard_majority_description,
    {
      $immediate_majority: formatPercent(immediateMajorityPercent),
      $standard_majority: formatPercent(standardMajorityPercent),
    }
  );
</script>

<ProposalContentCell testId="votes-results-component">
  <h2 slot="start" class="title">{$i18n.proposal_detail.voting_results}</h2>

  <div class="votes-info">
    <div class="yes yes-percent">
      <span class="caption">{$i18n.core.yes}</span>
      <span class="percentage" data-tid="adopt-percentage"
        >{formatPercentage(yesProportion)}</span
      >
    </div>
    <div class="no no-percent">
      <span class="caption">{$i18n.core.no}</span>
      <span class="percentage" data-tid="reject-percentage"
        >{formatPercentage(noProportion)}</span
      >
    </div>
    <div
      class="progressbar-container"
      style={`--immediate-majority: ${immediateMajorityPercent}%; --standard-majority:${standardMajorityPercent}%;`}
    >
      <div class="majority immediate-majority">
        <div class="majority-icon immediate-majority"></div>
      </div>
      <div class="majority standard-majority">
        <div class="majority-icon standard-majority"></div>
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
    <span class="yes-value caption">
      <span class="yes-no-value">
        <span>
          <span class="yes" data-tid="adopt">
            {formatVotingPower(yes)}
          </span>
          <span class="label description">
            {$i18n.proposal_detail__vote.voting_power}
          </span>
        </span>
        {#if superMajorityMode}
          <span>
            <span class="yes" data-tid="adopt-cast-votes">
              {formatPercent(castVotesYes)}
            </span>
            <span class="label description">
              {$i18n.proposal_detail__vote.cast_votes}
            </span>
          </span>
        {/if}
      </span>
      {#if superMajorityMode}
        <span data-tid="cast-votes-need" class="description">
          {replacePlaceholders($i18n.proposal_detail__vote.cast_votes_needs, {
            $immediate_majority: formatPercent(immediateMajorityPercent),
          })}
        </span>
      {/if}
    </span>
    <span class="no-value caption">
      <span class="yes-no-value">
        <span class="value-content">
          <span class="no" data-tid="reject">
            {formatVotingPower(no)}
          </span>
          <span class="label description">
            {$i18n.proposal_detail__vote.voting_power}
          </span>
        </span>
        {#if superMajorityMode}
          <span class="value-content">
            <span class="no" data-tid="reject-cast-votes">
              {formatPercent(castVotesNo)}
            </span>
            <span class="label description">
              {$i18n.proposal_detail__vote.cast_votes}
            </span>
          </span>
        {/if}
      </span>
    </span>
    <div class="remain" data-tid="remain">
      {#if showExpirationDate}
        <span class="caption description">
          {$i18n.proposal_detail__vote.expiration}
        </span>
        <div class="caption value">
          <Countdown {deadlineTimestampSeconds} />
        </div>
      {/if}
    </div>
  </div>

  <div class="votes-results-legends">
    <h3 class="description">
      {superMajorityMode
        ? $i18n.proposal_detail__vote.super_majority_decision_intro
        : $i18n.proposal_detail__vote.decision_intro}
    </h3>
    <ul>
      <li>
        <VotesResultsMajorityDescription testId="immediate-majority-toggle">
          <h4
            data-tid="immediate-majority-title"
            slot="title"
            class="description"
          >
            {immediateMajorityTitle}
          </h4>
          <p data-tid="immediate-majority-description" class="description">
            <Html text={iconifyDescription(immediateMajorityDescription)} />
          </p>
        </VotesResultsMajorityDescription>
      </li>
      <li>
        <VotesResultsMajorityDescription testId="standard-majority-toggle">
          <h4
            data-tid="standard-majority-title"
            slot="title"
            class="description"
          >
            {standardMajorityTitle}
          </h4>
          <p data-tid="standard-majority-description" class="description">
            <Html text={iconifyDescription(standardMajorityDescription)} />
          </p>
        </VotesResultsMajorityDescription>
      </li>
    </ul>
  </div>
</ProposalContentCell>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

  .title {
    @include fonts.h3(true);
  }

  .votes-info {
    display: grid;
    margin: var(--padding-2) 0;

    // 5 columns for mobile to give more space for the ".remain" section
    grid-template-areas:
      "yes-percent _ no-percent"
      "progressbar progressbar progressbar"
      "yes-value remain no-value";
    grid-template-columns: 1fr 1fr 1fr;

    @include media.min-width(small) {
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
    .hint {
      grid-area: hint;
      display: flex;
      justify-content: center;
      align-items: center;
      text-align: center;

      @include fonts.small(false);
    }
    .remain {
      grid-area: remain;
      display: flex;
      flex-direction: column;
      justify-content: start;
      text-align: center;
    }
    .progressbar-container {
      grid-area: progressbar;
      // to display majorities
      position: relative;
      margin-top: var(--padding-1_5x);

      .majority-icon {
        width: calc(var(--padding) * 0.75);
        height: calc(var(--padding) * 0.75);
      }
    }
    .yes-no-value {
      display: flex;
      flex-direction: column;
      gap: var(--padding-0_5x);
    }
    .yes-value {
      grid-area: yes-value;
    }
    .no-value {
      grid-area: no-value;
      text-align: right;
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

    &.immediate-majority {
      background: var(--purple-600);
    }
    &.standard-majority {
      background: var(--orange);
    }
  }

  .progressbar-container .majority {
    position: absolute;
    background: var(--card-background);
    width: calc(var(--padding) / 4);
    height: var(--padding-1_5x);

    &.immediate-majority {
      left: var(--immediate-majority);
      transform: translateX(-50%);
    }
    &.standard-majority {
      left: var(--standard-majority);
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
      transition: width ease-out var(--animation-time-normal);
    }
    .no {
      background: var(--negative-emphasis);
      transition: width ease-out var(--animation-time-normal);
    }
  }

  h3 {
    @include fonts.small;
  }

  h4 {
    margin: 0;
    display: inline-flex;
    align-items: center;
    column-gap: var(--padding-0_5x);

    @include fonts.small;
  }

  .votes-results-legends {
    margin-top: var(--padding-2x);
    display: flex;
    flex-direction: column;
    row-gap: var(--padding-0_5x);

    ul::marker {
      color: var(--description-color);
    }
  }

  // Dynamic description icon styles. Applied to the i18n html content.
  :global(.votes-results-legends .inline-maturity-icon) {
    display: inline-block;
    margin: 0 var(--padding-0_5x);
    width: var(--padding);
    height: var(--padding);
    border-radius: 50%;
  }
  :global(.votes-results-legends .inline-maturity-icon.immediate-majority) {
    background: var(--purple-600);
  }
  :global(.votes-results-legends .inline-maturity-icon.standard-majority) {
    background: var(--orange);
  }
</style>
