<script lang="ts">
  import MenuItem from "../ui/MenuItem.svelte";
  import IconWallet from "../../icons/IconWallet.svelte";
  import IconLockOpen from "../../icons/IconLockOpen.svelte";
  import IconHowToVote from "../../icons/IconHowToVote.svelte";
  import IconSettingsApplications from "../../icons/IconSettingsApplications.svelte";
  import type { SvelteComponent } from "svelte";

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
  <MenuItem {context} {label} {icon} />
{/each}

<style lang="scss">
  :global(svg) {
    width: 24px;
    height: 24px;
  }
</style>
