<script lang="ts">
  import EmptyCards from "$lib/components/common/EmptyCards.svelte";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { layoutTitleStore } from "$lib/stores/layout.store";
  import { PageBanner, IconAccountsPage } from "@dfinity/gix-components";

  layoutTitleStore.set({
    title: $i18n.wallet.title,
    header: "",
  });
</script>

<main class="sign-in" data-tid="accounts-landing-page">
  <!-- Safari doesn't handle well grid inside flexbox -->
  <!-- https://stackoverflow.com/questions/62075401/safari-grid-in-flexbox-produces-height-overflow -->
  <div>
    <PageBanner>
      <IconAccountsPage slot="image" />
      <svelte:fragment slot="title">{$i18n.auth_accounts.title}</svelte:fragment
      >
      <p class="description" slot="description">{$i18n.auth_accounts.text}</p>
      <SignIn slot="actions" />
    </PageBanner>
  </div>

  <EmptyCards />
</main>
