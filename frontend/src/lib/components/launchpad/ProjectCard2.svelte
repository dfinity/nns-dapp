<script lang="ts">
  import SignedInOnly from "$lib/components/common/SignedInOnly.svelte";
  import ProjectCardSwapInfo from "$lib/components/launchpad/ProjectCardSwapInfo.svelte";
  import Logo from "$lib/components/ui/Logo.svelte";
  import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
  import { loadSnsFinalizationStatus } from "$lib/services/sns-finalization.services";
  import { i18n } from "$lib/stores/i18n";
  import { createIsSnsFinalizingStore } from "$lib/stores/sns-finalization-status.store";
  import { getCommitmentE8s } from "$lib/utils/sns.utils";
  import {
    IconAccountBalance,
    IconCoin,
    IconRight,
    IconStar,
    IconVote,
    Spinner,
  } from "@dfinity/gix-components";
  import { nonNullish } from "@dfinity/utils";
  import { onMount } from "svelte";
  import CardFrame from "./CardFrame.svelte";
  import { AppPath } from "../../constants/routes.constants";

  type Props = {
    project: SnsFullProject;
  };

  const { project }: Props = $props();

  onMount(() => {
    loadSnsFinalizationStatus({ rootCanisterId: project.rootCanisterId });
  });

  const { summary, swapCommitment, rootCanisterId } = $derived(project);
  const {
    metadata: { logo, name, description },
  } = $derived(summary);
  const commitmentE8s = $derived(getCommitmentE8s(swapCommitment));
  const userHasParticipated = $derived(
    nonNullish(commitmentE8s) && commitmentE8s > 0n
  );
  const href = $derived(
    `${AppPath.Project}/?project=${project.rootCanisterId.toText()}`
  );
  // const isFinalizingStore = $derived(
  //   createIsSnsFinalizingStore(rootCanisterId)
  // );
</script>

<CardFrame testId="project-card-component" highlighted={userHasParticipated}>
  <div class="card-content" class:userHasParticipated>
    <div class="header">
      <Logo src={logo} alt={$i18n.sns_launchpad.project_logo} size="big" />
      <h3 data-tid="project-name">{name}</h3>
      <div class="fav-icon">
        <IconStar size="20px" />
      </div>
    </div>

    <p data-tid="project-description" class="description">{description}</p>

    <!-- 
    <ProjectCardSwapInfo isFinalizing={$isFinalizingStore} {project} />
    <SignedInOnly>
      {#if swapCommitment === undefined}
        <div class="spinner">
          <Spinner size="small" inline />
        </div>
      {/if}
    </SignedInOnly> -->
    <ul class="stats">
      <li class="stat-item">
        <h6 class="stat-label"> Token Price </h6>
        <div class="stat-value">
          <IconCoin size="16px" />
          <span data-tid="min-icp-value">$48.05</span>
        </div>
      </li>
      <li class="stat-item">
        <h6 class="stat-label"> Assets in Treasury </h6>
        <div class="stat-value">
          <IconAccountBalance size="16px" />
          <span data-tid="cap-icp-value">82.67%</span>
        </div>
      </li>
      <li class="stat-item">
        <h6 class="stat-label"> My Participation </h6>
        <div class="stat-value">
          <IconVote size="16px" />
          <span data-tid="funded-of-min-value">4/week</span>
        </div>
      </li>
    </ul>

    <div class="footer">
      <button class="ghost with-icon"><IconStar size="20px" /> Watch</button>
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
    @include launchpad.card_content;

    // Make the last row always be at the bottom of the card
    grid-template-rows: auto auto 1fr;

    &.userHasParticipated .stats .stat-item {
      border-right-color: var(--tertiary);
    }

    .header {
      @include launchpad.card_content_header;

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
      list-style: none;
      display: flex;

      // margin-bottom: auto;
      margin-top: auto;
      @include media.min-width(medium) {
        margin-top: 0;
      }

      .stat-item {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: var(--padding-0_5x);

        padding: 0 var(--padding);
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
      display: none;
      justify-content: space-between;
      align-items: end;

      @include media.min-width(medium) {
        display: flex;
      }

      .link,
      button {
        @include launchpad.text_button;

        color: var(--button-secondary-color);

        display: flex;
        align-items: center;
        gap: var(--padding-0_5x);
      }
    }
  }
</style>
