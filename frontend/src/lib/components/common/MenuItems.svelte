<script lang="ts">
  import MenuMetrics from "$lib/components/common/MenuMetrics.svelte";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import GetTokens from "$lib/components/ic/GetTokens.svelte";
  import ActionableProposalTotalCountBadge from "$lib/components/proposals/ActionableProposalTotalCountBadge.svelte";
  import { IS_TESTNET } from "$lib/constants/environment.constants";
  import { AppPath } from "$lib/constants/routes.constants";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { pageStore } from "$lib/derived/page.derived";
  import {
    canistersPathStore,
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
    IconExplore,
    IconNeurons,
    IconRocketLaunch,
    IconVote,
    IconWallet,
    MenuItem,
  } from "@dfinity/gix-components";
  import type { ComponentType } from "svelte";

  let routes: {
    context: string;
    href: string;
    selected: boolean;
    title: string;
    icon:
      | typeof IconWallet
      | typeof IconNeurons
      | typeof IconVote
      | typeof IconRocketLaunch
      | typeof IconExplore;
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
    {
      context: "canisters",
      href: $canistersPathStore,
      selected: isSelectedPath({
        currentPath: $pageStore.path,
        paths: [AppPath.Canisters, AppPath.Canister],
      }),
      title: $i18n.navigation.canisters,
      icon: IconExplore,
    },
  ];
</script>

<TestIdWrapper testId="menu-items-component">
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

  <MenuMetrics />
</TestIdWrapper>
