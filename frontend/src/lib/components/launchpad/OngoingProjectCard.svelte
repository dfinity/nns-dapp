<script lang="ts">
  import CardFrame from "$lib/components/launchpad/CardFrame.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { getMinDirectParticipation } from "$lib/getters/sns-summary";
  import { i18n } from "$lib/stores/i18n";
  import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
  import { formatNumber } from "$lib/utils/format.utils";
  import { formatParticipation } from "$lib/utils/portfolio.utils";
  import {
    durationTillSwapDeadline,
    getProjectCommitmentSplit,
  } from "$lib/utils/projects.utils";
  import {
    IconAccountBalance,
    IconClockNoFill,
    IconCoin,
    IconRight,
    IconRocketLaunch,
    Tag,
  } from "@dfinity/gix-components";
  import { secondsToDuration } from "@dfinity/utils";

  type Props = {
    summary: SnsSummaryWrapper;
  };

  const { summary }: Props = $props();

  const capIcp = $derived(
    getProjectCommitmentSplit(summary).totalCommitmentE8s
  );
  const minIcp = $derived(getMinDirectParticipation(summary) ?? 0n);
  const fundedOfMin = $derived(
    capIcp > 0n && minIcp > 0n ? (capIcp * 100n) / minIcp : 0n
  );
  const durationTillDeadline = $derived(
    durationTillSwapDeadline(summary.swap) ?? 0n
  );
  const href = $derived(
    `${AppPath.Project}/?project=${summary.rootCanisterId.toText()}`
  );
</script>

{#snippet backgroundIcon()}
  <div class="background-icon background-icon--mobile"
    ><IconRocketLaunch size="200px" /></div
  >
  <div class="background-icon background-icon--desktop"
    ><IconRocketLaunch size="270px" /></div
  >
{/snippet}

<CardFrame testId="ongoing-project-card" {backgroundIcon}>
  <div class="card-content">
    <div class="header">
      <Logo
        src={summary.metadata.logo}
        alt={summary.metadata.name}
        size="medium"
      />
      <h3 data-tid="project-name">{summary.metadata.name}</h3>
      <Tag size="medium">
        <span>{$i18n.portfolio.project_status_open}</span>
        <IconRocketLaunch size="14px" />
      </Tag>
    </div>

    <p class="description" data-tid="project-description"
      >{summary.metadata.description}</p
    >

    <ul class="stats">
      <li class="stat-item">
        <h6 class="stat-label">
          {$i18n.launchpad_cards.ongoing_funded_of_min}
        </h6>
        <div class="stat-value">
          <IconRocketLaunch size="16px" />
          <span data-tid="funded-of-min-value"
            >{formatNumber(Number(fundedOfMin), {
              minFraction: 0,
              maxFraction: 2,
            })}%</span
          >
        </div>
      </li>
      <li class="stat-item">
        <h6 class="stat-label">
          {$i18n.launchpad_cards.ongoing_min_icp}
        </h6>
        <div class="stat-value">
          <IconCoin size="16px" />
          <span data-tid="min-icp-value">{formatParticipation(minIcp)}</span>
        </div>
      </li>
      <li class="stat-item">
        <h6 class="stat-label">
          {$i18n.launchpad_cards.ongoing_cap_icp}
        </h6>
        <div class="stat-value">
          <IconAccountBalance size="16px" />
          <span data-tid="cap-icp-value">{formatParticipation(capIcp)}</span>
        </div>
      </li>
    </ul>

    <div class="footer">
      <div class="time-remaining">
        <IconClockNoFill size="20px" />
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
        aria-label={$i18n.core.view}
        data-tid="project-link"
      >
        <span>{$i18n.core.view}</span>
        <IconRight />
      </a>
    </div>
  </div>
</CardFrame>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  @use "@dfinity/gix-components/dist/styles/mixins/fonts";
  @use "@dfinity/gix-components/dist/styles/mixins/text";
  @use "../../themes/mixins/launchpad";
  @use "../../themes/mixins/portfolio";

  .background-icon {
    // TODO: Introduce in GIX once it is part of the design system
    color: #3d4d99;
    transform: rotate(270deg);
    position: absolute;

    right: -40px;
    bottom: -40px;

    @include media.min-width(medium) {
      right: -60px;
      bottom: -60px;
    }

    &--mobile {
      display: block;
      @include media.min-width(medium) {
        display: none;
      }
    }

    &--desktop {
      display: none;
      @include media.min-width(medium) {
        display: block;
      }
    }
  }

  .card-content {
    @include launchpad.card_content;

    // Make the last row always be at the bottom of the card
    grid-template-rows: auto auto 1fr;

    .header {
      @include launchpad.card_content_header;
      @include portfolio.card-tag;

      --logo-size: var(--padding-4x);
      @include media.min-width(medium) {
        --logo-size: 40px;
      }

      h3 {
        margin: 0;
        padding: 0;
        @include launchpad.text_h3;
        @include text.truncate;
      }
    }

    .description {
      margin-top: 0;
      color: var(--color-text-secondary);

      @include launchpad.text_h5;
      @include text.clamp(2);
    }

    .stats {
      padding: 0;
      margin-top: 0;
      margin-bottom: auto;
      list-style: none;
      display: flex;

      .stat-item {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: var(--padding-0_5x);

        padding: 0 var(--padding-2x);
        border-right: 1px solid var(--elements-divider);
        &:first-child {
          padding-left: 0;
        }
        &:last-child {
          padding-right: 0;
          border-right: none;
        }

        h6 {
          @include launchpad.text_h6;
          margin: 0;
        }

        .stat-value {
          @include launchpad.text_h4;

          display: flex;
          align-items: center;
          gap: var(--padding-0_5x);
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
        @include media.min-width(medium) {
          display: flex;
        }

        align-items: center;
        gap: var(--padding-0_5x);
      }
    }
  }
</style>
