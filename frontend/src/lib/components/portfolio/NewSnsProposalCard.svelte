<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";
  import VotesResult from "$lib/components/portfolio/VotesResult.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { pageStore } from "$lib/derived/page.derived";
  import { i18n } from "$lib/stores/i18n";
  import { buildProposalUrl } from "$lib/utils/navigation.utils";
  import { mapProposalInfoToCard } from "$lib/utils/portfolio.utils";
  import {
    IconClockNoFill,
    IconRight,
    IconVote,
    Tag,
  } from "@dfinity/gix-components";
  import type { ProposalInfo } from "@dfinity/nns";
  import { nonNullish, secondsToDuration } from "@dfinity/utils";

  type Props = {
    proposalInfo: ProposalInfo;
  };
  const { proposalInfo }: Props = $props();

  const proposal = $derived(mapProposalInfoToCard(proposalInfo));
  const universe = $derived($pageStore.universe);
  const href = $derived(
    nonNullish(proposal)
      ? buildProposalUrl({
          universe,
          proposalId: proposal.id,
          actionable: false,
        })
      : "#"
  );
</script>

{#if nonNullish(proposal)}
  <Card testId="new-sns-proposal-card">
    <div class="wrapper">
      <div class="header">
        <div class="title-wrapper">
          <div>
            {#if nonNullish(proposal?.logo) && nonNullish(proposal?.name)}
              <Logo src={proposal?.logo} alt={proposal?.name} size="medium" />
            {/if}
          </div>
          <h5 data-tid="project-name">{proposal.name}</h5>
        </div>
        <Tag size="medium">
          <span>{$i18n.portfolio.project_status_proposal}</span>
          <IconVote size="14px" />
        </Tag>
      </div>

      <div class="content">
        <div class="description-wrapper">
          <h3 class="title">{$i18n.portfolio.new_sns_proposal_card_title}</h3>
          <p class="description" data-tid="proposal-title">{proposal.title}</p>
        </div>
        <VotesResult
          yes={Number(proposalInfo.latestTally?.yes)}
          no={Number(proposalInfo.latestTally?.no)}
          total={Number(proposalInfo.latestTally?.total)}
        />
      </div>
      <div class="footer">
        <div class="time-remaining">
          <span class="icon">
            <IconClockNoFill size="20px" />
          </span>

          <span data-tid="time-remaining">
            {secondsToDuration({
              seconds: proposal.durationTillDeadline,
              i18n: $i18n.time,
            })}
          </span>
        </div>
        <a
          {href}
          class="link"
          aria-label={$i18n.portfolio.new_sns_proposal_card_link}
          data-tid="proposal-link"
        >
          <span class="text"
            >{$i18n.portfolio.new_sns_proposal_card_link}
          </span>
          <IconRight />
        </a>
      </div>
    </div>
  </Card>
{/if}

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
    /* Required to give space to the StackedCards dots */
    padding-bottom: var(--card-stacked-dots-space);

    @include media.min-width(medium) {
      padding: var(--padding-3x);

      /* Required to give space to the StackedCards dots */
      padding-bottom: var(--card-stacked-dots-space);
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

        h5 {
          margin: 0;
          padding: 0;
          @include text.truncate;
        }
      }
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: var(--padding-2x);
      height: 124px;

      .description-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--padding-0_5x);

        h3 {
          margin: 0;
          padding: 0;
        }

        .description {
          margin: 0;
          padding: 0;
          color: var(--color-text-secondary);
          max-width: 95%;

          @include text.truncate;
        }
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
