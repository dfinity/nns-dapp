<script lang="ts">
  import { onMount } from "svelte";
  import { bitcoinConvertBlockIndexes } from "$lib/stores/bitcoin.store";

  onMount(() => {
    console.log($bitcoinConvertBlockIndexes);
  });
</script>

<!-- display unfinished convert ckBTC to Btc warnings -->
