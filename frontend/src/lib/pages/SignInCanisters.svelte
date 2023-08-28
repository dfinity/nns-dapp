<script lang="ts">
  import EmptyCards from "$lib/components/common/EmptyCards.svelte";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { PageBanner, IconCanistersPage } from "@dfinity/gix-components";
</script>

<main class="sign-in">
  <PageBanner>
    <IconCanistersPage slot="image" />
    <svelte:fragment slot="title">{$i18n.auth_canisters.title}</svelte:fragment>
    <p class="description" slot="description">{$i18n.auth_canisters.text}</p>
    <SignIn slot="actions" />
  </PageBanner>

  <EmptyCards />
</main>
