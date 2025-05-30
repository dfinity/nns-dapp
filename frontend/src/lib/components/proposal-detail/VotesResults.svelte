<script lang="ts">
  import ProposalContentCell from "$lib/components/proposal-detail/ProposalContentCell.svelte";
  import VotesResultsConditionStatus from "$lib/components/proposal-detail/VotesResultsConditionStatus.svelte";
  import Countdown from "$lib/components/proposals/Countdown.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { nowInSeconds } from "$lib/utils/date.utils";
  import { formatNumber, formatPercentage } from "$lib/utils/format.utils";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { isCriticalProposal } from "$lib/utils/sns-proposals.utils";
  import { Html, IconExpandMore } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";

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

  // https://github.com/dfinity/ic/blob/d91cbbb662d03aee629902c7e4fd7ee5abdd6ba5/rs/nns/governance/src/governance.rs#L1035
  const getParticipationStatus = () => {
    const standardMajority = standardMajorityPercent / 100;

    if (yesProportion >= standardMajority) return "success";
    return canStillVote ? "default" : "failed";
  };

  // Critical proposals require that the number of "yes" votes is more than twice the number of "no" votes, while normal proposals only need "yes" votes to exceed "no" votes.
  // https://github.com/dfinity/ic/blob/d91cbbb662d03aee629902c7e4fd7ee5abdd6ba5/rs/nns/governance/src/governance.rs#L1036
  const getMajorityStatus = () => {
    const immediateYesMajority = yesProportion > immediateMajorityPercent / 100;
    const immediateNoMajority = noProportion > immediateMajorityPercent / 100;

    if (immediateYesMajority) return "success";
    if (immediateNoMajority) return "failed";
    if (canStillVote) return "default";

    const majority = isCriticalProposalMode ? yes > 2 * no : yes > no;
    return majority ? "success" : "failed";
  };

  type Props = {
    yes: number;
    no: number;
    total: number;
    deadlineTimestampSeconds?: bigint;
    immediateMajorityPercent: number;
    standardMajorityPercent: number;
  };
  const {
    yes,
    no,
    total,
    deadlineTimestampSeconds,
    immediateMajorityPercent,
    standardMajorityPercent,
  }: Props = $props();

  const yesProportion = $derived(total ? yes / total : 0);
  const noProportion = $derived(total ? no / total : 0);
  const yesNoSum = $derived(yes + no);
  const castVotesYes = $derived(yesNoSum > 0 ? (yes / yesNoSum) * 100 : 0);
  const castVotesNo = $derived(yesNoSum > 0 ? (no / yesNoSum) * 100 : 0);
  const canStillVote = $derived(
    nonNullish(deadlineTimestampSeconds) &&
      deadlineTimestampSeconds > BigInt(nowInSeconds())
  );

  const isCriticalProposalMode = $derived(
    isCriticalProposal(immediateMajorityPercent)
  );

  const immediateMajorityTitle = $derived(
    isCriticalProposalMode
      ? $i18n.proposal_detail__vote.immediate_super_majority
      : $i18n.proposal_detail__vote.immediate_majority
  );
  const immediateMajorityDescription = $derived(
    isCriticalProposalMode
      ? replacePlaceholders(
          $i18n.proposal_detail__vote.immediate_super_majority_description,
          {
            $immediate_majority: formatPercent(immediateMajorityPercent),
            $no_immediate_majority: formatPercent(
              100 - immediateMajorityPercent
            ),
          }
        )
      : $i18n.proposal_detail__vote.immediate_majority_description
  );

  const standardMajorityTitle = $derived(
    isCriticalProposalMode
      ? $i18n.proposal_detail__vote.standard_super_majority
      : $i18n.proposal_detail__vote.standard_majority
  );
  const standardMajorityDescription = $derived(
    replacePlaceholders(
      isCriticalProposalMode
        ? $i18n.proposal_detail__vote.standard_super_majority_description
        : $i18n.proposal_detail__vote.standard_majority_description,
      {
        $immediate_majority: formatPercent(immediateMajorityPercent),
        $standard_majority: formatPercent(standardMajorityPercent),
      }
    )
  );

  let expanded = $state(false);
  let toggleParticipationContent = $state(() => {});
  let toggleMajorityContent = $state(() => {});
  let toggleAllContent = $derived(() => {
    expanded = !expanded;
    toggleParticipationContent();
    toggleMajorityContent();
  });
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
            {$i18n.neurons.voting_power}
          </span>
        </span>
        {#if isCriticalProposalMode}
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
      {#if isCriticalProposalMode}
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
            {$i18n.neurons.voting_power}
          </span>
        </span>
        {#if isCriticalProposalMode}
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
      {#if canStillVote}
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
    <button
      class="votes-results-legends-expand-button"
      onclick={toggleAllContent}
      data-tid="toggle-content-button"
    >
      <h3 class="description">
        {isCriticalProposalMode
          ? $i18n.proposal_detail__vote.super_majority_decision_intro
          : $i18n.proposal_detail__vote.decision_intro}
      </h3>
      <span class="icon" aria-hidden="true" class:expanded>
        <IconExpandMore />
      </span>
    </button>
    <ol>
      <li>
        <VotesResultsConditionStatus
          testId="standard-majority-collapsible"
          bind:toggleContent={toggleParticipationContent}
          status={getParticipationStatus()}
        >
          {#snippet title()}
            <h4 data-tid="standard-majority-title" class="description">
              {standardMajorityTitle}
            </h4>
          {/snippet}

          <p data-tid="standard-majority-description" class="description">
            <Html text={iconifyDescription(standardMajorityDescription)} />
          </p>
        </VotesResultsConditionStatus>
      </li>
      <li>
        <VotesResultsConditionStatus
          testId="immediate-majority-collapsible"
          bind:toggleContent={toggleMajorityContent}
          status={getMajorityStatus()}
        >
          {#snippet title()}
            <h4 data-tid="immediate-majority-title" class="description">
              {immediateMajorityTitle}
            </h4>
          {/snippet}

          <p data-tid="immediate-majority-description" class="description">
            <Html text={iconifyDescription(immediateMajorityDescription)} />
          </p>
        </VotesResultsConditionStatus>
      </li>
    </ol>
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
      background: var(--orchid);
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
    @include fonts.standard;
  }

  h4 {
    margin: 0;
    @include fonts.standard;
  }

  .votes-results-legends {
    margin-top: var(--padding-2x);
    display: flex;
    flex-direction: column;
    row-gap: var(--padding-0_5x);

    .votes-results-legends-expand-button {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0;

      h3 {
        color: var(--content-color);
      }

      transition: transform ease-out var(--animation-time-normal);
      .icon {
        padding: 0;
        color: var(--primary);

        &.expanded {
          transform: rotate(-180deg);
        }
      }
    }

    ol {
      margin: 0;
    }

    li {
      margin: var(--padding-0_5x) 0;

      &::marker {
        color: var(--description-color);
      }

      p {
        margin: 0 0 var(--padding-2x);
      }
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
    background: var(--orchid);
  }
  :global(.votes-results-legends .inline-maturity-icon.standard-majority) {
    background: var(--orange);
  }
</style>
