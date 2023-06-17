<script lang="ts">
  import type { Universe } from "$lib/types/universe";
  import {
    isUniverseCkBTC,
    isUniverseCkTESTBTC,
  } from "$lib/utils/universe.utils";
  import { i18n } from "$lib/stores/i18n";

  export let universe: Universe;

  let ckBTC = false;
  $: ckBTC = isUniverseCkBTC(universe.canisterId);

  let ckTESTBTC = false;
  $: ckTESTBTC = isUniverseCkTESTBTC(universe.canisterId);
</script>

{universe.summary?.metadata.name ??
  (ckTESTBTC
    ? $i18n.ckbtc.test_title
    : ckBTC
    ? $i18n.ckbtc.title
    : $i18n.core.ic)}
