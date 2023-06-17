<script lang="ts">
  import Logo from "$lib/components/ui/Logo.svelte";
  import IC_LOGO_ROUNDED from "$lib/assets/icp-rounded.svg";
  import type { SnsSummary } from "$lib/types/sns";
  import type { Universe } from "$lib/types/universe";
  import CKBTC_LOGO from "$lib/assets/ckBTC.svg";
  import CKTESTBTC_LOGO from "$lib/assets/ckTESTBTC.svg";
  import {
    isUniverseCkBTC,
    isUniverseCkTESTBTC,
    universeLogoAlt,
  } from "$lib/utils/universe.utils";

  export let universe: Universe;
  export let size: "big" | "small" = "small";
  export let framed = false;

  let summary: SnsSummary | undefined;
  $: summary = universe.summary;

  let canisterId: string;
  $: canisterId = universe.canisterId;

  let ckBTC = false;
  $: ckBTC = isUniverseCkBTC(canisterId);

  let ckTESTBTC = false;
  $: ckTESTBTC = isUniverseCkTESTBTC(canisterId);

  let logo: string;
  $: logo =
    summary?.metadata.logo ??
    (ckTESTBTC ? CKTESTBTC_LOGO : ckBTC ? CKBTC_LOGO : IC_LOGO_ROUNDED);

  let title: string;
  $: title = universeLogoAlt(universe);
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
