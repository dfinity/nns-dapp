<script lang="ts">
  import CardFrame from "$lib/components/launchpad/CardFrame.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import { AppPath } from "$lib/constants/routes.constants";
  import { i18n } from "$lib/stores/i18n";
  import type { SnsSummaryWrapper } from "$lib/types/sns-summary-wrapper";
  import { durationTillSwapStart } from "$lib/utils/projects.utils";
  import {
    IconClockNoFill,
    IconOpenInNew,
    IconRight,
    IconRocketLaunch,
    Tag,
  } from "@dfinity/gix-components";
  import { secondsToDuration } from "@dfinity/utils";

  type Props = {
    summary: SnsSummaryWrapper;
  };

  const { summary }: Props = $props();

  const projectUrl = $derived(summary.metadata.url);

  const durationTillStart = $derived(durationTillSwapStart(summary.swap) ?? 0n);
  const href = $derived(
    `${AppPath.Project}/?project=${summary.rootCanisterId.toText()}`
  );
</script>

<CardFrame testId="upcoming-project-card-component">
  <div class="card-content">
    <div class="header">
      <Logo
        src={summary.metadata.logo}
        alt={summary.metadata.name}
        size="medium"
      />
      <h3 data-tid="project-name">{summary.metadata.name}</h3>
      <Tag size="medium">
        <span>{$i18n.launchpad_cards.upcoming_tag_upcoming}</span>
        <IconRocketLaunch size="14px" />
      </Tag>
    </div>

    <div class="content">
      <p class="description" data-tid="project-description"
        >{summary.metadata.description}</p
      >
      <a
        data-tid="project-site-link"
        href={projectUrl}
        target="_blank"
        rel="noopener noreferrer"
        class="link"
        aria-label={$i18n.launchpad_cards.upcoming_link}
      >
        <span class="text">{$i18n.launchpad_cards.upcoming_link}</span>
        <IconOpenInNew />
      </a>
    </div>

    <div class="footer">
      <div class="time-remaining">
        <IconClockNoFill size="20px" />
        <span>{$i18n.launchpad_cards.upcoming_sale_starts}</span>
        <span data-tid="time-remaining">
          {secondsToDuration({
            seconds: durationTillStart,
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

  .card-content {
    @include launchpad.card_content();

    background-color: var(--card-background-tint);
    // Make the last row always be at the bottom of the card
    grid-template-rows: auto auto 1fr;

    .header {
      @include launchpad.card_content_header();
      // @include portfolio.card-tag;

      --logo-size: var(--padding-4x);
      @include media.min-width(medium) {
        --logo-size: 40px;
      }

      h3 {
        @include launchpad.text_h3;
        // TODO: move to _launchpad mixin
        @include text.truncate;

        margin: 0;
        padding: 0;
      }
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: var(--padding);

      .description {
        @include launchpad.text_h5;
        @include text.clamp(5);

        margin: 0;
        color: var(--color-text-secondary);
      }

      .link {
        @include launchpad.text_button;

        display: flex;
        align-items: center;
        gap: var(--padding);
        color: var(--button-primary);
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
