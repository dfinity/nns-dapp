<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { i18n } from "$lib/stores/i18n";
  import type { SnsSummarySwap } from "$lib/types/sns";
  import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
  import { formatCurrencyNumber } from "$lib/utils/format.utils";
  import { formatParticipation } from "$lib/utils/portfolio.utils";
  import {
    durationTillSwapDeadline,
    getProjectCommitmentSplit,
    type FullProjectCommitmentSplit,
  } from "$lib/utils/projects.utils";
  import { ulpsToNumber } from "$lib/utils/token.utils";
  import {
    IconClockNoFill,
    IconRight,
    IconRocketLaunch,
    Tag,
  } from "@dfinity/gix-components";
  import { ICPToken, nonNullish, secondsToDuration } from "@dfinity/utils";

  export let summary: SnsSummaryWrapper;
  let swap: SnsSummarySwap;
  $: ({ swap } = summary);

  let projectCommitment: FullProjectCommitmentSplit;
  $: projectCommitment = getProjectCommitmentSplit(
    summary
  ) as FullProjectCommitmentSplit;

  let directCommitment: number;
  $: directCommitment = ulpsToNumber({
    ulps: projectCommitment.directCommitmentE8s,
    token: ICPToken,
  });

  let formattedDirectCommitment: string;
  $: formattedDirectCommitment = formatCurrencyNumber(directCommitment);

  let formattedMinCommitmentIcp: string;
  $: formattedMinCommitmentIcp = formatParticipation(
    projectCommitment.minDirectCommitmentE8s
  );

  let formattedMaxCommitmentIcp: string;
  $: formattedMaxCommitmentIcp = formatParticipation(
    projectCommitment.maxDirectCommitmentE8s
  );

  let nfCommitment: bigint | undefined;
  $: nfCommitment = projectCommitment.nfCommitmentE8s;

  let formattedNfCommitmentPercentage: string | null;
  $: formattedNfCommitmentPercentage = nonNullish(nfCommitment)
    ? formatParticipation(nfCommitment)
    : null;

  let durationTillDeadline: bigint;
  $: durationTillDeadline = durationTillSwapDeadline(swap) ?? 0n;

  let href: string;
  $: href = `${AppPath.Project}/?project=${summary.rootCanisterId.toText()}`;
</script>

<Card testId="launch-project-card">
  <div class="wrapper">
    <div class="header">
      <div class="title-wrapper">
        <div>
          <Logo
            src={summary.metadata.logo}
            alt={summary.metadata.name}
            size="medium"
          />
        </div>
        <h3 data-tid="project-name">{summary.metadata.name}</h3>
      </div>
      <Tag size="medium">
        <span>{$i18n.portfolio.project_status_adopted}</span>
        <IconRocketLaunch size="14px" />
      </Tag>
    </div>

    <p class="description" data-tid="project-description"
      >{summary.metadata.description}</p
    >

    <div class="commitment-section">
      <h4 class="section-title">
        {$i18n.portfolio.open_project_card_title}
      </h4>

      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">
            {$i18n.portfolio.open_project_current_commitment}
          </span>
          <span
            class="stat-value direct-commitment"
            data-tid="direct-commitment">{formattedDirectCommitment}</span
          >
        </div>

        <div class="vertical-divider"></div>

        <div class="stat-item">
          <span class="stat-label">
            {$i18n.portfolio.open_project_card_min_icp}
          </span>
          <span class="stat-value" data-tid="min-direct-commitment">
            {formattedMinCommitmentIcp}
          </span>
        </div>

        <div class="stat-item">
          <span class="stat-label">
            {$i18n.portfolio.open_project_card_max_icp}
          </span>
          <span class="stat-value" data-tid="max-direct-commitment">
            {formattedMaxCommitmentIcp}
          </span>
        </div>

        {#if nonNullish(formattedNfCommitmentPercentage)}
          <div class="stat-item" data-tid="nf-commitment-field">
            <div class="stat-label"
              >{$i18n.portfolio.open_project_card_nf}
              <TooltipIcon
                text={$i18n.header.account_id_tooltip}
                tooltipId="main-icp-account-id-tooltip"
              />
            </div>
            <div class="stat-value" data-tid="nf-commitment"
              >{formattedNfCommitmentPercentage}</div
            >
          </div>
        {/if}
      </div>
    </div>

    <div class="footer">
      <div class="time-remaining">
        <span class="icon">
          <IconClockNoFill />
        </span>

        <span data-tid="time-remaining">
          {secondsToDuration({
            seconds: durationTillDeadline,
            i18n: $i18n.time,
          })}
        </span>
      </div>
      <a {href} class="link" aria-label="something" data-tid="project-link">
        <span>{$i18n.portfolio.open_project_card_link}</span>
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

    gap: var(--padding-2x);
    padding: var(--padding-2x);

    @include media.min-width(medium) {
      padding: var(--padding-3x);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .title-wrapper {
        display: flex;
        align-items: center;

        gap: var(--padding);

        h3 {
          margin: 0;
          padding: 0;
        }
      }
    }

    .description {
      margin: 0;
      color: var(--color-text-secondary);
      flex-grow: 1;

      @include text.clamp(2);
    }

    .commitment-section {
      display: flex;
      flex-direction: column;
      gap: var(--padding-0_5x);
    }

    .section-title {
      color: var(--text-description);
      @include fonts.small(true);
    }

    .stats {
      display: flex;
      gap: var(--padding-2x);

      .stat-item {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: var(--padding-0_5x);

        .stat-label {
          display: flex;
          align-items: center;
          height: 16px;
          gap: var(--padding-0_5x);
          @include fonts.small(false);
        }

        .stat-value {
          font-size: var(--font-size-standard);
          font-weight: var(--font-weight-bold);
        }

        .direct-commitment {
          @include fonts.h2(true);
          line-height: 1;
        }
      }
      .vertical-divider {
        border-right: 1px solid var(--elements-divider);
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
          width: 20px;
          height: 20px;
          color: var(--text-description);
        }
      }

      .link {
        display: flex;
        align-items: center;
        color: var(--button-secondary-color);
        font-weight: var(--font-weight-bold);
        text-decoration: none;
      }
    }
  }
</style>
