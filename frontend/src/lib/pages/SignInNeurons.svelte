<script lang="ts">
  import EmptyCards from "$lib/components/common/EmptyCards.svelte";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import SummaryUniverse from "$lib/components/summary/SummaryUniverse.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { IconNeuronsPage, PageBanner } from "@dfinity/gix-components";

  layoutTitleStore.set({
    title: $i18n.neuron_detail.title,
  });
</script>

<main>
  <SummaryUniverse />

  <div class="content">
    <PageBanner>
      <IconNeuronsPage slot="image" />
      <svelte:fragment slot="title">{$i18n.auth_neurons.title}</svelte:fragment>
      <p class="description" slot="description">{$i18n.neurons.text}</p>
      <SignIn slot="actions" />
    </PageBanner>

    <EmptyCards />
  </div>
</main>

<style lang="scss">
  .content {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);
  }
</style>
