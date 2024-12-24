<script lang="ts">
  import ReportingNeurons from "$lib/components/reporting/ReportingNeurons.svelte";
  import ReportingTransactions from "$lib/components/reporting/ReportingTransactions.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { Island } from "@dfinity/gix-components";
  import { debounce } from "@dfinity/utils";
  import { onMount } from "svelte";

  // Defer the title to avoid a visual glitch where the title moves from left to center in the header if navigation happens from Accounts page
  onMount(
    debounce(
      () =>
        layoutTitleStore.set({
          title: $i18n.navigation.reporting,
        }),
      500
    )
  );
</script>

<Island testId="reporting-page">
  <main>
    <ReportingNeurons />
    <Separator spacing="medium" />
    <ReportingTransactions />
  </main>
</Island>

<style lang="scss">
  main {
    padding: var(--padding-3x);
  }
</style>
