<script lang="ts">
  import ReportingNeuronsButton from "$lib/components/reporting/ReportingNeuronsButton.svelte";
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

<Island>
  <main>
    <div class="wrapper">
      <div>
        <h3>{$i18n.reporting.neurons_title}</h3>
        <p class="description">{$i18n.reporting.neurons_description}</p>
      </div>
      <ReportingNeuronsButton />
    </div>

    <Separator spacing="medium" />

    <ReportingTransactions />
  </main>
</Island>

<style lang="scss">
  main {
    padding: var(--padding-3x);
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--padding-3x);
  }
</style>
