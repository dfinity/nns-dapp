<script lang="ts">
  import SourceCodeButton from "$lib/components/common/SourceCodeButton.svelte";
  import GetTokens from "$lib/components/ic/GetTokens.svelte";
  import TotalValueLocked from "$lib/components/metrics/TotalValueLocked.svelte";
  import NnsNeuronsMissingRewardsBadge from "$lib/components/neurons/NnsNeuronsMissingRewardsBadge.svelte";
  import ActionableProposalTotalCountBadge from "$lib/components/proposals/ActionableProposalTotalCountBadge.svelte";
  import { IS_TESTNET } from "$lib/constants/environment.constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { pageStore } from "$lib/derived/page.derived";
  import { proposalsPathStore } from "$lib/derived/paths.derived";
  import {
    ENABLE_PERIODIC_FOLLOWING_CONFIRMATION,
    ENABLE_PORTFOLIO_PAGE,
  } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import {
    ACTIONABLE_PROPOSALS_URL,
    isSelectedPath,
  } from "$lib/utils/navigation.utils";
  import {
    IconHome,
    IconNeurons,
    IconRocketLaunch,
    IconVote,
    IconWallet,
    MenuItem,
    ThemeToggleButton,
    layoutMenuOpen,
    menuCollapsed,
  } from "@dfinity/gix-components";
  import type { ComponentType } from "svelte";
  import { cubicIn, cubicOut } from "svelte/easing";
  import { scale } from "svelte/transition";

  let routes: {
    context: string;
    href: string;
    selected: boolean;
    title: string;
    icon:
      | typeof IconWallet
      | typeof IconNeurons
      | typeof IconVote
      | typeof IconRocketLaunch;
    statusIcon?: ComponentType;
  }[];
  $: routes = [
    ...($ENABLE_PORTFOLIO_PAGE
      ? [
          {
            context: "portfolio",
            href: AppPath.Portfolio,
            selected: isSelectedPath({
              currentPath: $pageStore.path,
              paths: [AppPath.Portfolio],
            }),
            title: $i18n.navigation.portfolio,
            icon: IconHome,
          },
        ]
      : []),
    {
      context: "accounts",
      href: AppPath.Tokens,
      selected: isSelectedPath({
        currentPath: $pageStore.path,
        paths: [AppPath.Accounts, AppPath.Wallet, AppPath.Tokens],
      }),
      title: $i18n.navigation.tokens,
      icon: IconWallet,
    },
    {
      context: "neurons",
      href: AppPath.Staking,
      selected: isSelectedPath({
        currentPath: $pageStore.path,
        paths: [AppPath.Staking, AppPath.Neurons, AppPath.Neuron],
      }),
      title: $i18n.navigation.neurons,
      icon: IconNeurons,
      statusIcon: $ENABLE_PERIODIC_FOLLOWING_CONFIRMATION
        ? NnsNeuronsMissingRewardsBadge
        : undefined,
    },
    {
      context: "proposals",
      href:
        // Switch to the actionable proposals page only when users are signed in.
        // When users are signed out, we preserve the universe in the URL.
        $authSignedInStore ? ACTIONABLE_PROPOSALS_URL : $proposalsPathStore,
      selected: isSelectedPath({
        currentPath: $pageStore.path,
        paths: [AppPath.Proposals, AppPath.Proposal],
      }),
      title: $i18n.navigation.voting,
      icon: IconVote,
      statusIcon: ActionableProposalTotalCountBadge,
    },
    {
      context: "launchpad",
      href: `${AppPath.Launchpad}`,
      selected: isSelectedPath({
        currentPath: $pageStore.path,
        paths: [AppPath.Launchpad, AppPath.Project],
      }),
      title: $i18n.navigation.launchpad,
      icon: IconRocketLaunch,
    },
  ];
</script>

<div data-tid="menu-items-component" class="menu-container">
  {#each routes as { context, title, href, icon, statusIcon, selected } (context)}
    <MenuItem {href} testId={`menuitem-${context}`} {selected} {title}>
      <svelte:component this={icon} slot="icon" />
      <svelte:fragment>{title}</svelte:fragment>
      <svelte:component this={statusIcon} slot="statusIcon" />
    </MenuItem>
  {/each}

  {#if IS_TESTNET}
    <GetTokens />
  {/if}

  {#if !$menuCollapsed || $layoutMenuOpen}
    <div
      data-tid="menu-footer"
      class="menu-footer"
      out:scale={{ duration: 200, easing: cubicOut }}
      in:scale={{ duration: 200, easing: cubicIn }}
    >
      <TotalValueLocked layout="stacked" />
      <div class="menu-footer-buttons">
        <div class="grow-item"><SourceCodeButton /></div>
        <ThemeToggleButton />
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  .menu-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .menu-footer {
    display: flex;
    flex-direction: column;
    gap: var(--padding);
    margin-top: auto;
    margin-right: var(--padding-3x);
  }
  .menu-footer-buttons {
    display: flex;
    gap: var(--padding);
    .grow-item {
      flex-grow: 1;
    }
  }
</style>
