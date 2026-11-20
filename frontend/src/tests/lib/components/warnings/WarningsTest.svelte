<script lang="ts">
  import Metrics from "$lib/components/metrics/Metrics.svelte";
  import TransactionRateWarning from "$lib/components/warnings/TransactionRateWarning.svelte";
  import { Toasts } from "$lib/gix";
</script>

<!-- ENABLE_METRICS is global false for test that is why instead of mocking declare the same components here -->
<Metrics />
<TransactionRateWarning />
<Toasts position="top" />
