<script lang="ts">
  import {
    IconExplore,
    IconVote,
    IconNeurons,
    IconRocketLaunch,
    IconWallet,
    MenuItem,
  } from "@dfinity/gix-components";
  import type { ComponentType } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import { AppPath } from "$lib/constants/routes.constants";
  import { IS_TESTNET } from "$lib/constants/environment.constants";
  import TestIdWrapper from "$lib/components/common/TestIdWrapper.svelte";
  import GetTokens from "$lib/components/ic/GetTokens.svelte";
  import {
    canistersPathStore,
    neuronsPathStore,
    proposalsPathStore,
  } from "$lib/derived/paths.derived";
  import { pageStore } from "$lib/derived/page.derived";
  import { isSelectedPath } from "$lib/utils/navigation.utils";
  import MenuMetrics from "$lib/components/common/MenuMetrics.svelte";

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
      href: $neuronsPathStore,
      selected: isSelectedPath({
        currentPath: $pageStore.path,
        paths: [AppPath.Neurons, AppPath.Neuron],
      }),
      title: $i18n.navigation.neurons,
      icon: IconNeurons,
    },
    {
      context: "proposals",
      href: $proposalsPathStore,
      selected: isSelectedPath({
        currentPath: $pageStore.path,
        paths: [AppPath.Proposals, AppPath.Proposal],
      }),
      title: $i18n.navigation.voting,
      icon: IconVote,
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
