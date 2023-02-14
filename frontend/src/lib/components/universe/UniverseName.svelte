<script lang="ts">
  import type { Universe } from "$lib/types/universe";
  import { isUniverseCkBTC } from "$lib/utils/universe.utils";
  import { i18n } from "$lib/stores/i18n";

  export let universe: Universe;

  let ckBTC = false;
  $: ckBTC = isUniverseCkBTC(universe.canisterId);
</script>

{universe.summary?.metadata.name ?? (ckBTC ? $i18n.ckbtc.title : $i18n.core.ic)}
