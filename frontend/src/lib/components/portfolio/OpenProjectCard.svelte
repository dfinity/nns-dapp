<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import TooltipIcon from "$lib/components/ui/TooltipIcon.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import {
    getMaxNeuronsFundParticipation,
    getNeuronsFundParticipation,
  } from "$lib/getters/sns-summary";
  import { i18n } from "$lib/stores/i18n";
  import type { SnsSummarySwap } from "$lib/types/sns";
  import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
  import { formatPercentage } from "$lib/utils/format.utils";
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
  import { secondsToDuration, type Token } from "@dfinity/utils";

  export let summary: SnsSummaryWrapper;
  let swap: SnsSummarySwap;
  $: ({ swap } = summary);

  // Todo: What can I reuse?
  // what is ULPS? maybe build token and then get ULPS thento number?
  // new util function for these numbers
  const formatParticipation = (ulps: bigint, token: Token) => {
    const value = ulpsToNumber({ ulps, token });
    if (value < 10_000) return value.toString();
    return `${(value / 1_000).toFixed(2)}K`;
  };

  // Now all projects are new
  let projectCommitments: FullProjectCommitmentSplit;
  $: projectCommitments = getProjectCommitmentSplit(
    summary
  ) as FullProjectCommitmentSplit;
  let currentCommitmentPercentage: string;
  $: currentCommitmentPercentage =
    projectCommitments.minDirectCommitmentE8s === 0n
      ? formatPercentage(0, {
          minFraction: 2,
          maxFraction: 2,
        })
      : formatPercentage(
          ulpsToNumber({
            ulps: projectCommitments.directCommitmentE8s,
            token: summary.token,
          }) /
            ulpsToNumber({
              ulps: projectCommitments.minDirectCommitmentE8s,
              token: summary.token,
            }),
          { minFraction: 2, maxFraction: 2 }
        );

  let minCommitmentIcp;
  $: minCommitmentIcp = formatParticipation(
    summary.getMinIcpE8s(),
    summary.token
  );

  let maxCommitmentIcp;
  $: maxCommitmentIcp = formatParticipation(
    summary.getMaxIcpE8s(),
    summary.token
  );
  let maxNfParticipation: bigint | undefined;
  $: maxNfParticipation = getMaxNeuronsFundParticipation(summary) ?? 1n;

  let nfCommitment: bigint | undefined;
  $: nfCommitment = getNeuronsFundParticipation(summary);

  let nfCommitmentPercentage;
  // what about projectCommitments.nfCommitmentE8s?
  $: nfCommitmentPercentage = projectCommitments.isNFParticipating
    ? formatPercentage(
        ulpsToNumber({
          ulps: nfCommitment ?? 0n,
          token: summary.token,
        }) /
          ulpsToNumber({
            ulps: maxNfParticipation,
            token: summary.token,
          }),
        { minFraction: 2, maxFraction: 2 }
      )
    : null;

  let durationTillDeadline: bigint | undefined;
  $: durationTillDeadline = durationTillSwapDeadline(swap);

  let href: string;
  // TODO(yhabib): extract into util. 2 usecases
  $: href = `${AppPath.Project}/?project=${summary.rootCanisterId.toText()}`;
</script>

<Card testId="open-projects-card">
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
        <h3>{summary.metadata.name}</h3>
      </div>
      <Tag size="medium">
        <span>{$i18n.portfolio.project_status_adopted}</span>
        <IconRocketLaunch size="14px" />
      </Tag>
    </div>

    <p class="description">{summary.metadata.description}</p>

    <div class="commitment-section">
      <h4 class="section-title">
        {$i18n.portfolio.open_project_card_title}
      </h4>

      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">
            {$i18n.portfolio.open_project_card_min_fund}
          </span>
          <span class="stat-value funding-percentage"
            >{currentCommitmentPercentage}</span
          >
        </div>

        <div class="vertical-divider"></div>

        <div class="stat-item">
          <span class="stat-label">
            {$i18n.portfolio.open_project_card_min_icp}
          </span>
          <span class="stat-value">
            {minCommitmentIcp}
          </span>
        </div>

        <div class="stat-item">
          <span class="stat-label">
            {$i18n.portfolio.open_project_card_max_icp}
          </span>
          <span class="stat-value">
            {maxCommitmentIcp}
          </span>
        </div>

        <div class="stat-item">
          <div class="stat-label"
            >{$i18n.portfolio.open_project_card_nf}
            <TooltipIcon
              text={$i18n.header.account_id_tooltip}
              tooltipId="main-icp-account-id-tooltip"
            />
          </div>
          <div class="stat-value">{nfCommitmentPercentage}</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <div class="time-remaining">
        <span class="icon">
          <IconClockNoFill />
        </span>

        {secondsToDuration({
          seconds: durationTillDeadline ?? 0n,
          i18n: $i18n.time,
        })}
      </div>
      <a {href} class="link" aria-label="something">
        <span>{$i18n.portfolio.open_project_card_link}</span>
        <IconRight />
      </a>
    </div>
  </div>
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";

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

        .funding-percentage {
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
