<script lang="ts">
  import CardList from "$lib/components/launchpad/CardList.svelte";
  import type { SnsFullProject } from "$lib/derived/sns/sns-projects.derived";
  import { i18n } from "$lib/stores/i18n";
  import type { ComponentWithProps } from "$lib/types/svelte";
  import {
    getLaunchedSnsProjectCards,
    getUpcomingLaunchesCards,
  } from "$lib/utils/launchpad.utils";
  import type { ProposalInfo } from "@dfinity/nns";

  type Props = {
    snsProjects: SnsFullProject[];
    openSnsProposals: ProposalInfo[];
  };

  const { snsProjects, openSnsProposals }: Props = $props();

  const upcomingLaunchesCards = $derived(
    getUpcomingLaunchesCards({
      snsProjects,
      openSnsProposals,
    })
  );

  const launchedSnsProjectCards: ComponentWithProps[] = $derived(
    getLaunchedSnsProjectCards(snsProjects)
  );
</script>

<main data-tid="launchpad2-component">
  <div class="header">
    <h3>{$i18n.launchpad.headline}</h3>
    <p>{$i18n.launchpad.subheadline}</p>
  </div>
  {#if upcomingLaunchesCards.length > 0}
    <section>
      <h4>{$i18n.launchpad.upcoming_launches}</h4>
      <CardList testId="upcoming-launches-list" cards={upcomingLaunchesCards} />
    </section>
  {/if}
  {#if launchedSnsProjectCards.length > 0}
    <section>
      <h4>{$i18n.launchpad.launched_projects}</h4>
      <CardList
        testId="launched-projects-list"
        cards={launchedSnsProjectCards}
      />
    </section>
  {/if}
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    gap: var(--padding-3x);
  }

  h3 {
    font-family: "CircularXX TT";
    font-size: 24px;
    font-weight: 500;
    line-height: 32px;
  }

  section {
    margin: 0;
    padding: 0;
    max-width: none;
  }

  h4 {
    font-size: 16px;
    font-weight: 450;
    line-height: 20px;
  }

  p {
    margin: 0;

    font-family: "CircularXX TT";
    font-size: 16px;
    font-style: normal;
    font-weight: 400;
    line-height: 24px;
    color: var(--text-description);
  }
</style>
