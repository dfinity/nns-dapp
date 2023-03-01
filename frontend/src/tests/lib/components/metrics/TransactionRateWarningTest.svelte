<script lang="ts">
  import Metrics from "$lib/components/metrics/Metrics.svelte";
  import TransactionRateWarning from "$lib/components/metrics/TransactionRateWarning.svelte";
  import { Toasts } from "@dfinity/gix-components";
</script>

<TransactionRateWarning />
<Metrics />
<Toasts position="top" />
