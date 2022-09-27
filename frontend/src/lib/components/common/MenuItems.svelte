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
  import { i18n } from "../../stores/i18n";
  import { baseHref } from "../../utils/route.utils";
  import { isRoutePath } from "../../utils/app-path.utils";
  import { AppPath } from "../../constants/routes.constants";
  import { routeStore } from "../../stores/route.store";
  import {
    ENABLE_SNS,
    IS_TESTNET,
  } from "../../constants/environment.constants";
  import BadgeNew from "../ui/BadgeNew.svelte";
  import GetICPs from "../ic/GetICPs.svelte";

  const baseUrl: string = baseHref();

  const isSelectedPath = (paths: AppPath[]): boolean =>
    isRoutePath({ paths, routePath: $routeStore.path });

  const routes: {
    context: string;
    selected: boolean;
    label: string;
    icon: typeof SvelteComponent;
    statusIcon?: typeof SvelteComponent;
  }[] = [
    {
      context: "accounts",
      selected: isSelectedPath([
        AppPath.Accounts,
        AppPath.LegacyAccounts,
        AppPath.Wallet,
        AppPath.LegacyWallet,
      ]),
      label: "tokens",
      icon: IconWallet,
    },
    {
      context: "neurons",
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
      selected: isSelectedPath([AppPath.Proposals, AppPath.ProposalDetail]),
      label: "voting",
      icon: IconHowToVote,
    },
    {
      context: "canisters",
      selected: isSelectedPath([AppPath.Canisters, AppPath.CanisterDetail]),
      label: "canisters",
      icon: IconEngineering,
    },
    // Launchpad should not be visible on mainnet
    ...(ENABLE_SNS
      ? [
          {
            context: "launchpad",
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

{#each routes as { context, label, icon, statusIcon, selected }}
  <MenuItem
    href={`${baseUrl}#/${context}`}
    testId={`menuitem-${context}`}
    {selected}
  >
    <svelte:component this={icon} slot="icon" />
    <svelte:fragment>{$i18n.navigation[label]}</svelte:fragment>
    <svelte:component this={statusIcon} slot="statusIcon" />
  </MenuItem>
{/each}

{#if IS_TESTNET}
  <GetICPs />
{/if}
