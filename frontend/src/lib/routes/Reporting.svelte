<script lang="ts">
  import ReportingNeuronsButton from "$lib/components/reporting/ReportingNeuronsButton.svelte";
  import { queryNeurons } from "$lib/api/governance.api";
  import ReportingTransactionsButton from "$lib/components/reporting/ReportingTransactionsButton.svelte";
  import Separator from "$lib/components/ui/Separator.svelte";
  import { authStore } from "$lib/stores/auth.store";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { toastsError } from "$lib/stores/toasts.store";
  import { sortNeuronsByStake } from "$lib/utils/neuron.utils";
  import type { Identity } from "@dfinity/agent";
  import { Island } from "@dfinity/gix-components";
  import type { NeuronInfo } from "@dfinity/nns";
  import { debounce, nonNullish } from "@dfinity/utils";
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

  let identity: Identity | null | undefined;
  // TODO: It will be remove soon
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let neurons: NeuronInfo[] = [];

  $: identity = $authStore.identity;

  const loadNeurons = async (identity: Identity) => {
    if (!identity) return;

    try {
      const data = await queryNeurons({
        certified: true,
        identity: identity,
        includeEmptyNeurons: true,
      });

      neurons = sortNeuronsByStake(data);
    } catch (err) {
      console.error("Failed to load neurons:", err);
      toastsError({
        labelKey: "reporting.fetching_neurons_error",
      });
    }
  };

  $: if (nonNullish(identity)) {
    loadNeurons(identity);
  }
</script>

<Island>
  <main>
    <div>
      <h3>{$i18n.reporting.neurons_title}</h3>
      <p class="description">{$i18n.reporting.neurons_description}</p>
      <ReportingNeuronsButton />
    </div>
    <Separator spacing="medium" />
    <div>
      <h3>{$i18n.reporting.transactions_title}</h3>
      <p class="description">{$i18n.reporting.transactions_description}</p>
      <ReportingTransactionsButton />
    </div>
  </main>
</Island>

<style lang="scss">
  main {
    padding: var(--padding-3x);
  }
</style>
