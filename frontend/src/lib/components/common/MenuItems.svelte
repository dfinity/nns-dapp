<script lang="ts">
  import MenuMetrics from "$lib/components/common/MenuMetrics.svelte";
  import GetTokens from "$lib/components/ic/GetTokens.svelte";
  import ActionableProposalTotalCountBadge from "$lib/components/proposals/ActionableProposalTotalCountBadge.svelte";
  import { IS_TESTNET } from "$lib/constants/environment.constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { pageStore } from "$lib/derived/page.derived";
  import {
    neuronsPathStore,
    proposalsPathStore,
  } from "$lib/derived/paths.derived";
  import { ENABLE_PROJECTS_TABLE } from "$lib/stores/feature-flags.store";
  import { i18n } from "$lib/stores/i18n";
  import {
    ACTIONABLE_PROPOSALS_URL,
    isSelectedPath,
  } from "$lib/utils/navigation.utils";
  import {
    IconNeurons,
    IconRocketLaunch,
    IconVote,
    IconWallet,
    MenuItem,
    ThemeToggleButton,
  } from "@dfinity/gix-components";
  import type { ComponentType } from "svelte";
  import SourceCodeButton from "./SourceCodeButton.svelte";
  import { layoutMenuOpen, menuCollapsed } from "@dfinity/gix-components";

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
      href: $ENABLE_PROJECTS_TABLE ? AppPath.Staking : $neuronsPathStore,
      selected: isSelectedPath({
        currentPath: $pageStore.path,
        paths: [AppPath.Staking, AppPath.Neurons, AppPath.Neuron],
      }),
      title: $i18n.navigation.neurons,
      icon: IconNeurons,
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

  <div class="menu-footer" class:hidden={$menuCollapsed && !$layoutMenuOpen}>
    <MenuMetrics />
    <div class="menu-footer-buttons">
      <div class="grow-item"><SourceCodeButton /></div>
      <ThemeToggleButton />
    </div>
  </div>
</div>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";
  .menu-container {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .menu-footer {
    display: none;
    flex-direction: column;
    gap: var(--padding);
    // To accomodate the 100% on-chain logo
    // if that logo changes please update this margin as well
    margin: auto var(--padding-3x) var(--padding-8x) 0;
    // Handle menu collapse animation
    opacity: 1;
    transition:
      transform linear var(--animation-time-normal),
      opacity linear calc(var(--animation-time-short) / 2);
    &.hidden {
      opacity: 0;
      transform: translate(-150%, 0);
    }
    //Hide menu footer similar to surrounding elements
    @media (min-height: 654px) {
      display: flex;
    }
  }
  .menu-footer-buttons {
    display: flex;
    gap: var(--padding);
    .grow-item {
      flex-grow: 1;
    }
  }
</style>
