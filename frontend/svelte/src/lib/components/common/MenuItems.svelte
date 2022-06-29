<script lang="ts">
  import MenuItem from "../ui/MenuItem.svelte";
  import IconWallet from "../../icons/IconWallet.svelte";
  import IconLockOpen from "../../icons/IconLockOpen.svelte";
  import IconHowToVote from "../../icons/IconHowToVote.svelte";
  import IconSettingsApplications from "../../icons/IconSettingsApplications.svelte";
  import type { SvelteComponent } from "svelte";
  import { i18n } from "../../stores/i18n";
  import { baseHref } from "../../utils/route.utils";
  import { isRoutePath } from "../../utils/app-path.utils";
  import { AppPath } from "../../constants/routes.constants";
  import { routeStore } from "../../stores/route.store";
  import IconRocketLaunch from "../../icons/IconRocketLaunch.svelte";
  import { IS_TESTNET } from "../../constants/environment.constants";
  import New from "../ui/New.svelte";

  const baseUrl: string = baseHref();

  const isSelectedPath = (paths: AppPath[]): boolean =>
    paths.find((path: AppPath) =>
      isRoutePath({ path, routePath: $routeStore.path })
    ) !== undefined;

  const routes: {
    context: string;
    selected: boolean;
    label: string;
    icon: typeof SvelteComponent;
    statusIcon?: typeof SvelteComponent;
  }[] = [
    {
      context: "accounts",
      selected: isSelectedPath([AppPath.Accounts, AppPath.Wallet]),
      label: "accounts",
      icon: IconWallet,
    },
    {
      context: "neurons",
      selected: isSelectedPath([AppPath.Neurons, AppPath.NeuronDetail]),
      label: "neurons",
      icon: IconLockOpen,
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
      icon: IconSettingsApplications,
    },
  ];

  if (IS_TESTNET) {
    // Launchpad should not be available on mainnet
    routes.push({
      context: "launchpad",
      selected: isSelectedPath([
        AppPath.SNSLaunchpad,
        AppPath.SNSProjectDetail,
      ]),
      label: "launchpad",
      icon: IconRocketLaunch,
      statusIcon: New,
    });
  }
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

<style lang="scss">
  :global(svg) {
    width: var(--padding-3x);
    height: var(--padding-3x);
  }
</style>
