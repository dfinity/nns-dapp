<script lang="ts">
  import EmptyCards from "$lib/components/common/EmptyCards.svelte";
  import SignIn from "$lib/components/common/SignIn.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { IconSettingsPage, PageBanner } from "@dfinity/gix-components";
</script>

<main>
  <div class="content">
    <PageBanner>
      <IconSettingsPage slot="image" />
      <svelte:fragment slot="title">{$i18n.auth_report.title}</svelte:fragment>
      <p class="description" slot="description">{$i18n.auth_report.text}</p>
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
