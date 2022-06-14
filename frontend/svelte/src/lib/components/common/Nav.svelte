<script lang="ts">
  import MenuItem from "../ui/MenuItem.svelte";
  import IconPerson from "../../icons/IconPerson.svelte";
  import IconLan from "../../icons/IconLan.svelte";
  import IconHowToVote from "../../icons/IconHowToVote.svelte";
  import IconSettingsApplications from "../../icons/IconSettingsApplications.svelte";
  import type { SvelteComponent } from "svelte";

  const routes: { context: string; label: string; icon: typeof SvelteComponent }[] = [
    { context: "accounts", label: "accounts", icon: IconPerson },
    { context: "neurons", label: "neurons", icon: IconLan },
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
