<script lang="ts">
  import {
    MenuItem,
    IconWallet,
    IconHowToVote,
    IconRocketLaunch,
    IconEngineering,
    IconPsychology,
  } from "@dfinity/gix-components";
  import type { SvelteComponent } from "svelte";
  import { i18n } from "$lib/stores/i18n";
  import { baseHref } from "$lib/utils/route.utils";
  import { isRoutePath } from "$lib/utils/app-path.utils";
  import { AppPath } from "$lib/constants/routes.constants";
  import { routeStore } from "$lib/stores/route.store";
  import { ENABLE_SNS, IS_TESTNET } from "$lib/constants/environment.constants";
  import BadgeNew from "$lib/components/ui/BadgeNew.svelte";
  import GetTokens from "$lib/components/ic/GetTokens.svelte";
  import {
    accountsPathStore,
    neuronsPathStore,
  } from "$lib/derived/paths.derived";
  import { keyOf } from "$lib/utils/utils";

  const baseUrl = baseHref();

  const isSelectedPath = (paths: AppPath[]): boolean =>
    isRoutePath({ paths, routePath: $routeStore.path });

  let routes: {
    context: string;
    href: string;
    selected: boolean;
    label: string;
    icon: typeof SvelteComponent;
    statusIcon?: typeof SvelteComponent;
  }[];
  $: routes = [
    {
      context: "accounts",
      href: $accountsPathStore,
      selected: isSelectedPath([
        AppPath.Accounts,
        AppPath.LegacyAccounts,
        AppPath.Wallet,
      ]),
      label: "tokens",
      icon: IconWallet,
    },
    {
      context: "neurons",
      href: $neuronsPathStore,
      selected: isSelectedPath([
        AppPath.LegacyNeurons,
        AppPath.LegacyNeuronDetail,
        AppPath.NeuronDetail,
        AppPath.Neurons,
      ]),
      label: "neurons",
      icon: IconPsychology,
    },
    {
      context: "proposals",
      href: `${baseUrl}#/proposals`,
      selected: isSelectedPath([AppPath.Proposals, AppPath.ProposalDetail]),
      label: "voting",
      icon: IconHowToVote,
    },
    {
      context: "canisters",
      href: `${baseUrl}#/canisters`,
      selected: isSelectedPath([AppPath.Canisters, AppPath.CanisterDetail]),
      label: "canisters",
      icon: IconEngineering,
    },
    // Launchpad should not be visible on mainnet
    ...(ENABLE_SNS
      ? [
          {
            context: "launchpad",
            href: `${baseUrl}#/launchpad`,
            selected: isSelectedPath([
              AppPath.Launchpad,
              AppPath.ProjectDetail,
            ]),
            label: "launchpad",
            icon: IconRocketLaunch,
            statusIcon: BadgeNew,
          },
        ]
      : []),
  ];
</script>

{#each routes as { context, label, href, icon, statusIcon, selected } (context)}
  <MenuItem {href} testId={`menuitem-${context}`} {selected}>
    <svelte:component this={icon} slot="icon" />
    <svelte:fragment
      >{keyOf({ obj: $i18n.navigation, key: label })}</svelte:fragment
    >
    <svelte:component this={statusIcon} slot="statusIcon" />
  </MenuItem>
{/each}

{#if IS_TESTNET}
  <GetTokens />
{/if}
