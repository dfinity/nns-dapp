<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { PRICE_NOT_AVAILABLE_PLACEHOLDER } from "$lib/constants/constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { i18n } from "$lib/stores/i18n";
  import type { TableProject } from "$lib/types/staking";
  import { formatNumber } from "$lib/utils/format.utils";
  import { formatTokenV2 } from "$lib/utils/token.utils";
  import { IconNeuronsPage, IconRight } from "@dfinity/gix-components";
  import { TokenAmountV2 } from "@dfinity/utils";
  import MaturityWithTooltip from "../neurons/MaturityWithTooltip.svelte";

  export let topProjects: TableProject[];
  export let usdAmount: number;
  export let numberOfTopTokens: number;

  const href = AppPath.Staking;
  let usdAmountFormatted: string;
  $: usdAmountFormatted = $authSignedInStore
    ? formatNumber(usdAmount)
    : PRICE_NOT_AVAILABLE_PLACEHOLDER;

  let numberOfTopProjects: number;
  $: numberOfTopProjects = topProjects.length;

  let showInfoRow: boolean;
  $: showInfoRow = numberOfTopTokens - numberOfTopProjects > 0;
</script>

<Card testId="projects-card">
  <div
    class="wrapper"
    role="region"
    aria-label={$i18n.portfolio.projects_card_title}
  >
    <div class="header">
      <div class="header-wrapper">
        <div class="icon" aria-hidden="true">
          <IconNeuronsPage />
        </div>
        <div class="text-content">
          <h5 class="title">{$i18n.portfolio.projects_card_title}</h5>
          <p
            class="amount"
            data-tid="amount"
            aria-label={`${$i18n.portfolio.projects_card_title}: ${usdAmount}`}
          >
            ${usdAmountFormatted}
          </p>
        </div>
      </div>
      <a
        {href}
        class="button secondary"
        aria-label={$i18n.portfolio.projects_card_link}
      >
        <span class="mobile-only">
          <IconRight />
        </span>
        <span class="tablet-up">
          {$i18n.portfolio.projects_card_link}
        </span>
      </a>
    </div>
    <div class="body" role="table">
      <div class="header" role="row">
        <span role="columnheader"
          >{$i18n.portfolio.projects_card_list_first_column}</span
        >

        <span class="mobile-only justify-end" role="columnheader"
          >{$i18n.portfolio.projects_card_list_second_column_mobile}</span
        >
        <span class="tablet-up justify-end" role="columnheader"
          >{$i18n.portfolio.projects_card_list_second_column}</span
        >
        <span class="tablet-up justify-end" role="columnheader"
          >{$i18n.portfolio.projects_card_list_third_column}</span
        >
      </div>

      <div class="list" role="rowgroup">
        {#each topProjects as project (project.domKey)}
          <div class="row" data-tid="project-card-row" role="row">
            <div class="info" role="cell">
              <div>
                <Logo
                  src={project.logo}
                  alt={project.title}
                  size="medium"
                  framed
                />
              </div>
              <span data-tid="project-title">{project.title}</span>
            </div>

            <div class="maturity" data-tid="project-maturity" role="cell">
              {#if $authSignedInStore}
                <MaturityWithTooltip
                  availableMaturity={project?.availableMaturity ?? 0n}
                  stakedMaturity={project?.stakedMaturity ?? 0n}
                />
              {:else}
                {PRICE_NOT_AVAILABLE_PLACEHOLDER}
              {/if}
            </div>
            <div
              class="staked-usd"
              data-tid="project-staked-usd"
              role="cell"
              aria-label={`${project.title} USD: ${project?.stakeInUsd ?? 0}`}
            >
              ${formatNumber(project?.stakeInUsd ?? 0)}
            </div>
            <div
              class="staked-native"
              data-tid="project-staked-native"
              role="cell"
              aria-label={`${project.title} D: ${project?.stakeInUsd ?? 0}`}
            >
              {project.stake instanceof TokenAmountV2
                ? formatTokenV2({
                    value: project.stake,
                    detailed: true,
                  })
                : PRICE_NOT_AVAILABLE_PLACEHOLDER}
              {project.stake.token.symbol}
            </div>
          </div>
        {/each}
        {#if showInfoRow}
          <div class="info-row desktop-only" role="note" data-tid="info-row">
            <div class="content">
              <div class="icon" aria-hidden="true">
                <IconNeuronsPage />
              </div>
              <div class="message">
                {$i18n.portfolio.projects_card_info_row}
              </div>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</Card>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--card-background-tint);

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--padding-3x) var(--padding-2x);

      .header-wrapper {
        display: flex;
        align-items: flex-start;
        gap: var(--padding-2x);

        .icon {
          width: 50px;
          height: 50px;
        }

        .text-content {
          display: flex;
          flex-direction: column;
          gap: var(--padding-0_5x);

          .title {
            font-size: 0.875rem;
            font-weight: bold;
            color: var(--text-description);
            margin: 0;
            padding: 0;
          }
          .amount {
            font-size: 1.5rem;
          }
        }
      }
    }

    .body {
      display: flex;
      flex-direction: column;
      gap: var(--padding);
      flex-grow: 1;

      .header {
        display: grid;
        grid-template-columns: 1fr 1fr;
        justify-content: space-between;

        font-size: 0.875rem;
        color: var(--text-description);
        padding: 0 var(--padding-2x);

        @include media.min-width(medium) {
          grid-template-columns: 1fr 1fr 1fr;
        }
      }

      .list {
        display: flex;
        flex-direction: column;
        background-color: var(--card-background);
        flex-grow: 1;

        .row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-areas:
            "info usd"
            "info maturity";
          @include media.min-width(medium) {
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-areas:
              "info maturity usd"
              "info maturity native";
          }

          align-items: center;
          padding: var(--padding-3x) var(--padding-2x);

          border-top: 1px solid var(--elements-divider);

          .info {
            grid-area: info;
            display: flex;
            align-items: center;
            gap: var(--padding);
          }

          .maturity,
          .staked-usd,
          .staked-native {
            justify-self: end;
            text-align: right;
          }

          .maturity {
            grid-area: maturity;
            font-size: 0.875rem;
            color: var(--text-description);

            @include media.min-width(medium) {
              font-size: var(--font-size-standard);
              color: var(--text-primary);
            }
          }

          .staked-usd {
            grid-area: usd;
          }

          .staked-native {
            display: none;
            grid-area: native;
            font-size: 0.875rem;
            color: var(--text-description);

            @include media.min-width(medium) {
              display: block;
            }
          }
        }
      }

      .info-row {
        flex-grow: 1;
        border-top: 1px solid var(--elements-divider);

        .content {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: var(--padding-2x);
          padding: var(--padding-1_5x) 0;

          max-width: 90%;
          margin: 0 auto;
          .icon {
            min-width: 50px;
            height: 50px;
          }

          .message {
            font-size: 0.875rem;
            color: var(--text-description);
            max-width: 400px;
          }
        }
      }
    }

    /* Utilities */
    .tablet-up,
    .desktop-only {
      display: none !important;
    }

    @include media.min-width(medium) {
      .mobile-only {
        display: none;
      }
      .tablet-up {
        display: flex !important;
      }
    }

    @include media.min-width(large) {
      .desktop-only {
        display: flex !important;
      }
    }

    .justify-end {
      justify-self: end;
    }
  }
</style>
