<script lang="ts">
  import VotesResultsMajorityDescription from "$lib/components/proposal-detail/VotesResultsMajorityDescription.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { replacePlaceholders } from "$lib/utils/i18n.utils";
  import { isCriticalProposal } from "$lib/utils/sns-proposals.utils";
  import { Html } from "@dfinity/gix-components";

  const iconifyDescription = (description: string) =>
    description
      .replace(/\$icon_immediate_majority/g, immediateMajorityIcon)
      .replace(/\$icon_standard_majority/g, standardMajorityIcon);

  const immediateMajorityIcon = `<span class="inline-maturity-icon immediate-majority"></span>`;
  const standardMajorityIcon = `<span class="inline-maturity-icon standard-majority"></span>`;

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
</script>

<div class="votes-results-legends">
  <h3 class="description">
    {isCriticalProposalMode
      ? $i18n.proposal_detail__vote.super_majority_decision_intro
      : $i18n.proposal_detail__vote.decision_intro}
  </h3>
  <ol>
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
        <h4 data-tid="standard-majority-title" slot="title" class="description">
          {standardMajorityTitle}
        </h4>
        <p data-tid="standard-majority-description" class="description">
          <Html text={iconifyDescription(standardMajorityDescription)} />
        </p>
      </VotesResultsMajorityDescription>
    </li>
  </ol>
</div>

<style lang="scss">
  .votes-results-legends {
    margin-top: var(--padding-2x);
    display: flex;
    flex-direction: column;
    row-gap: var(--padding-0_5x);

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
</style>
