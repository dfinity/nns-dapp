<script lang="ts">
  import EmptyCards from "$lib/components/common/EmptyCards.svelte";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { PageBanner, IconNeuronsPage } from "@dfinity/gix-components";

  layoutTitleStore.set({
    title: $i18n.neuron_detail.title,
    header: "",
  });
</script>

<main class="sign-in">
  <PageBanner>
    <IconNeuronsPage slot="image" />
    <svelte:fragment slot="title">{$i18n.auth_neurons.title}</svelte:fragment>
    <p class="description" slot="description">{$i18n.auth_neurons.text}</p>
    <SignIn slot="actions" />
  </PageBanner>

  <EmptyCards />
</main>
