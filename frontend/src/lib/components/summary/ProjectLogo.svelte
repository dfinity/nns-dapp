<script lang="ts">
  import Logo from "$lib/components/ui/Logo.svelte";
  import { INTERNET_COMPUTER, IC_LOGO } from "$lib/constants/icp.constants";
  import type { SnsSummary } from "$lib/types/sns";
  import { snsProjectSelectedStore } from "$lib/derived/selected-project.derived";
  import { ENABLE_SNS } from "$lib/constants/environment.constants";

  export let size: "big" | "small" = "small";
  export let selectProjects = ENABLE_SNS;

  let summary: SnsSummary | undefined;
  $: summary = selectProjects ? $snsProjectSelectedStore?.summary : undefined;

  let logo: string;
  $: logo = summary?.metadata.logo ?? IC_LOGO;

  let title: string;
  $: title = summary?.metadata.name ?? INTERNET_COMPUTER;
</script>

<div class={`${size}`}>
  <Logo src={logo} alt="" {size} framed={false} testId="accounts-logo" />
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
