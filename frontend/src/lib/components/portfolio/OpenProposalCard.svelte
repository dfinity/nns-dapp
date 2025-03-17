<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { pageStore } from "$lib/derived/page.derived";
  import { i18n } from "$lib/stores/i18n";
  import { durationUntilDeadline } from "$lib/utils/date.utils";
  import { buildProposalUrl } from "$lib/utils/navigation.utils";
  import {
    IconClockNoFill,
    IconRight,
    IconVote,
    Tag,
  } from "@dfinity/gix-components";
  import type { Proposal, ProposalId, ProposalInfo } from "@dfinity/nns";
  import { nonNullish, secondsToDuration } from "@dfinity/utils";
  import VotesResult from "./VotesResult.svelte";

  export let proposalInfo: ProposalInfo;
  let proposal: Proposal;
  $: proposal = proposalInfo.proposal;
  $: console.log(proposal);

  let durationTillDeadline: bigint;
  $: durationTillDeadline = durationUntilDeadline(
    proposalInfo.deadlineTimestampSeconds ?? 0n
  );

  let href: string;
  $: href = nonNullish(proposalInfo.id)
    ? buildProposalUrl({
        universe: $pageStore.universe,
        proposalId: proposalInfo.id as ProposalId,
        actionable: false,
      })
    : "#";
</script>

<Card testId="launch-project-card">
  <div class="wrapper">
    <div class="header">
      <div class="title-wrapper">
        <div>
          <Logo
            src={proposal.action?.CreateServiceNervousSystem?.logo
              ?.base64Encoding}
            alt={proposal.action?.CreateServiceNervousSystem?.name}
            size="medium"
          />
        </div>
        <h5 data-tid="project-name"
          >{proposal.action?.CreateServiceNervousSystem?.name}</h5
        >
      </div>
      <Tag size="medium">
        <span>{$i18n.portfolio.project_status_proposal}</span>
        <IconVote size="14px" />
      </Tag>
    </div>

    <div class="content">
      <h3 class="title" data-tid="proposal-title"
        >{$i18n.portfolio.open_proposal_card_title}</h3
      >

      <blockquote>
        <p class="description" data-tid="proposal-description"
          >{proposal.title}</p
        >
      </blockquote>
    </div>

    <VotesResult
      yes={Number(proposalInfo.latestTally?.yes)}
      no={Number(proposalInfo.latestTally?.no)}
      total={Number(proposalInfo.latestTally?.total)}
    />

    <div class="footer">
      <div class="time-remaining">
        <span class="icon">
          <IconClockNoFill size="20px" />
        </span>

        <span data-tid="time-remaining">
          {secondsToDuration({
            seconds: durationTillDeadline,
            i18n: $i18n.time,
          })}
        </span>
      </div>
      <a
        {href}
        class="link"
        aria-label={$i18n.portfolio.open_proposal_card_link}
        data-tid="proposal-link"
      >
        <span class="text">{$i18n.portfolio.open_proposal_card_link} </span>
        <IconRight />
      </a>
    </div>
  </div>
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";
  @use "@dfinity/gix-components/dist/styles/mixins/text";

  .wrapper {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    height: 100%;
    background-color: var(--card-background-tint);
    min-height: 240px;

    gap: var(--padding-2x);
    padding: var(--padding-2x);
    padding-bottom: var(--padding-3x);

    @include media.min-width(medium) {
      padding: var(--padding-3x);
      padding-bottom: var(--padding-4x);
    }

    .header {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      gap: var(--padding-0_5x);

      .title-wrapper {
        display: flex;
        align-items: center;
        gap: var(--padding);

        h4 {
          margin: 0;
          padding: 0;
          @include text.truncate;
        }
      }
    }

    .content {
      /* flex-grow: 1; */

      .description {
        margin: 0;
        color: var(--color-text-secondary);
        flex-grow: 1;

        @include text.clamp(2);
      }
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .time-remaining {
        display: flex;
        align-items: center;
        gap: var(--padding);

        .icon {
          display: flex;
          color: var(--text-description);
        }
      }

      .link {
        display: flex;
        align-items: center;
        justify-content: center;

        color: var(--button-secondary-color);
        font-weight: var(--font-weight-bold);
        text-decoration: none;

        width: 35px;
        height: 35px;
        border: solid var(--button-border-size) var(--primary);
        border-radius: 50%;
        box-sizing: border-box;

        @include media.min-width(medium) {
          width: auto;
          height: auto;
          border: none;
        }

        .text {
          display: none;
          @include media.min-width(medium) {
            display: inline;
          }
        }
      }
    }
  }
</style>
