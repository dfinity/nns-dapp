<script lang="ts">
  import MenuItem from "../ui/MenuItem.svelte";
  import IconWallet from "../../icons/IconWallet.svelte";
  import IconLockOpen from "../../icons/IconLockOpen.svelte";
  import IconHowToVote from "../../icons/IconHowToVote.svelte";
  import IconSettingsApplications from "../../icons/IconSettingsApplications.svelte";
  import type { SvelteComponent } from "svelte";
  import { i18n } from "../../stores/i18n";
  import { baseHref, routeContext } from "../../utils/route.utils";

  const baseUrl: string = baseHref();
  let currentContext: string = routeContext();

  const routes: {
    context: string;
    label: string;
    icon: typeof SvelteComponent;
  }[] = [
    { context: "accounts", label: "accounts", icon: IconWallet },
    { context: "neurons", label: "neurons", icon: IconLockOpen },
    { context: "proposals", label: "voting", icon: IconHowToVote },
    {
      context: "canisters",
      label: "canisters",
      icon: IconSettingsApplications,
    },
  ];
</script>

{#each routes as { context, label, icon }}
  <MenuItem
    href={`${baseUrl}#/${context}`}
    testId={`menuitem-${context}`}
    selected={currentContext === context}
  >
    <svelte:component this={icon} slot="icon" />
    <svelte:fragment>{$i18n.navigation[label]}</svelte:fragment>
  </MenuItem>
{/each}

<style lang="scss">
  :global(svg) {
    width: 24px;
    height: 24px;
  }
</style>
