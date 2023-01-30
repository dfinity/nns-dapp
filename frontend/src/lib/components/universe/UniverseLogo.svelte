<script lang="ts">
  import Logo from "$lib/components/ui/Logo.svelte";
  import { IC_LOGO } from "$lib/constants/icp.constants";
  import type { SnsSummary } from "$lib/types/sns";
  import { i18n } from "$lib/stores/i18n";
  import type { Universe } from "$lib/types/universe";
  import CKBTC_LOGO from "$lib/assets/ckBTC.svg";
  import { isUniverseCkBTC } from "$lib/utils/universe.utils";

  export let universe: Universe;
  export let size: "big" | "small" = "small";
  export let framed = false;

  let summary: SnsSummary | undefined;
  $: summary = universe.summary;

  let canisterId: string;
  $: canisterId = universe.canisterId;

  let ckBTC = false;
  $: ckBTC = isUniverseCkBTC(canisterId);

  // TODO: use ckBTC logo provided by ledger
  let logo: string;
  $: logo = summary?.metadata.logo ?? (ckBTC ? CKBTC_LOGO : IC_LOGO);

  let title: string;
  $: title =
    summary?.metadata.name !== undefined
      ? `${summary?.metadata.name} ${$i18n.sns_launchpad.project_logo}`
      : ckBTC
      ? $i18n.ckbtc.logo
      : $i18n.auth.ic_logo;
</script>

<div class={`${size}`} data-tid="project-logo">
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
