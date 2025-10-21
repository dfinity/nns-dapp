<script lang="ts">
  import CardFrame from "$lib/components/launchpad/CardFrame.svelte";
  import VotesResult from "$lib/components/portfolio/VotesResult.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import VoteLogo from "$lib/components/universe/VoteLogo.svelte";
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
  import type { ProposalInfo } from "@icp-sdk/canisters/nns";
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
  <CardFrame testId="create-sns-proposal-card-component" mobileHref={href}>
    <div class="card-content">
      <div class="header">
        {#if nonNullish(proposal?.logo) && nonNullish(proposal?.name)}
          <Logo src={proposal?.logo} alt={proposal?.name} size="small" />
        {:else}
          <VoteLogo size="medium" />
        {/if}
        <h3 data-tid="project-name">{proposal.name}</h3>
        <Tag size="medium">
          <span>{$i18n.portfolio.project_status_proposal}</span>
          <IconVote size="14px" />
        </Tag>
      </div>

      <div class="content">
        <div class="description-wrapper">
          <h3 class="title"
            >{$i18n.launchpad_cards.create_sns_proposal_title}</h3
          >
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
          <IconClockNoFill size="20px" />
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
          aria-label={$i18n.core.view}
          data-tid="proposal-link"
        >
          <span>{$i18n.launchpad_cards.create_sns_proposal_vote}</span>
          <IconRight />
        </a>
      </div>
    </div>
  </CardFrame>
{/if}

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";
  @use "@dfinity/gix-components/dist/styles/mixins/text";
  @use "../../themes/mixins/launchpad";
  @use "../../themes/mixins/portfolio";

  .card-content {
    @include launchpad.card_content;

    // Make the last row always be at the bottom of the card
    grid-template-rows: auto auto 1fr;

    .header {
      @include launchpad.card_content_header;
      @include portfolio.card-tag;

      --logo-size: var(--padding-4x);
      @include media.min-width(small) {
        --logo-size: 40px;
      }

      h3 {
        margin: 0;
        padding: 0;
        @include launchpad.text_h3;
        @include text.truncate;
      }
    }

    .content {
      display: flex;
      flex-direction: column;

      .description-wrapper {
        display: flex;
        flex-direction: column;
        gap: var(--padding-0_5x);

        h3 {
          @include text.clamp(1);

          margin: 0;
          padding: 0;

          font-size: 16px;
          font-weight: 450;
          line-height: 20px;

          @include media.min-width(small) {
            font-size: 18px;
            line-height: 24px;
          }
        }

        .description {
          @include launchpad.text_body;
          @include text.clamp(1);

          display: none;
          margin: 0;
          padding: 0;
          color: var(--color-text-secondary);

          @include media.min-width(small) {
            display: block;
            // To support -webkit-line-clamp
            display: -webkit-box;
          }
        }
      }
    }

    .footer {
      display: flex;
      justify-content: space-between;
      align-items: end;

      .time-remaining {
        @include launchpad.text_body;

        display: flex;
        align-items: center;
        gap: var(--padding);
      }

      .link {
        @include launchpad.text_button;
        color: var(--button-secondary-color);

        display: none;
        @include media.min-width(small) {
          display: flex;
        }

        align-items: center;
        gap: var(--padding-0_5x);
      }
    }
  }
</style>
