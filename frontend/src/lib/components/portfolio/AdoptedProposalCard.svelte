<script lang="ts">
  import Card from "$lib/components/portfolio/Card.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { i18n } from "$lib/stores/i18n";
  import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
  import { durationTillSwapStart } from "$lib/utils/projects.utils";
  import {
    IconClockNoFill,
    IconRight,
    IconRocketLaunch,
    Tag,
  } from "@dfinity/gix-components";
  import { secondsToDuration } from "@dfinity/utils";

  type Props = {
    summary: SnsSummaryWrapper;
  };

  const { summary }: Props = $props();
  const durationTillStart = $derived(durationTillSwapStart(summary.swap) ?? 0n);
  const href = $derived(
    `${AppPath.Project}/?project=${summary.rootCanisterId.toText()}`
  );
</script>

<Card testId="adopted-proposal-card">
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
        <span>{$i18n.portfolio.project_status_adopted_proposal}</span>
        <IconRocketLaunch size="14px" />
      </Tag>
    </div>

    <div class="content">
      <p class="description" data-tid="project-description"
        >{summary.metadata.description}</p
      >
    </div>

    <div class="footer">
      <div class="time-remaining-wrapper">
        <h4 class="section-title">
          {$i18n.portfolio.adopted_proposal_card_time_remaining}
        </h4>

        <div class="time-remaining">
          <span class="icon">
            <IconClockNoFill size="20px" />
          </span>

          <span data-tid="time-remaining">
            {secondsToDuration({
              seconds: durationTillStart,
              i18n: $i18n.time,
            })}
          </span>
        </div>
      </div>
      <a {href} class="link" aria-label="something" data-tid="project-link">
        <span class="text">{$i18n.portfolio.open_project_card_link} </span>
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
    height: 270px;
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
        h3 {
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
      flex-grow: 1;
      .description {
        margin: 0;
        color: var(--color-text-secondary);
        height: calc(5 * var(--line-height-standard) * 1rem);
        @include text.clamp(5);
      }
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      .time-remaining-wrapper {
        display: flex;
        flex-direction: column;
        .section-title {
          color: var(--text-description);
          @include fonts.small(true);
        }
        .time-remaining {
          display: flex;
          align-items: center;
          gap: var(--padding);
          .icon {
            display: flex;
            color: var(--text-description);
          }
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
