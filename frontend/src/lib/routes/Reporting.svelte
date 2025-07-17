<script lang="ts">
  import ReportingNeurons from "$lib/components/reporting/ReportingNeurons.svelte";
  import ReportingTransactions from "$lib/components/reporting/ReportingTransactions.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { Island } from "@dfinity/gix-components";

  layoutTitleStore.set({
    title: $i18n.navigation.reporting,
  });
</script>

<Island testId="reporting-page-component">
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
