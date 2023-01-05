<script lang="ts">
  import Logo from "$lib/components/ui/Logo.svelte";
  import { IC_LOGO } from "$lib/constants/icp.constants";
  import type { SnsSummary } from "$lib/types/sns";
  import { i18n } from "$lib/stores/i18n";

  export let size: "big" | "medium" | "small" = "small";
  export let summary: SnsSummary | undefined;
  export let framed = false;

  let logo: string;
  $: logo = summary?.metadata.logo ?? IC_LOGO;

  let title: string;
  $: title =
    summary?.metadata.name !== undefined
      ? `${summary?.metadata.name} ${$i18n.sns_launchpad.project_logo}`
      : $i18n.auth.ic_logo;
</script>

<div class={`${size}`}>
  <Logo src={logo} alt={title} {size} {framed} testId="logo" />
</div>

<style lang="scss">
  div {
    display: flex;
    justify-content: center;
    align-items: center;
    width: fit-content;
  }

  .small {
    padding: 0 var(--padding);
  }
</style>
