<script lang="ts">
  import SignIn from "$lib/components/common/SignIn.svelte";
  import ProjectsTable from "$lib/components/staking/ProjectsTable.svelte";
  import { authSignedInStore } from "$lib/derived/auth.derived";
  import { i18n } from "$lib/stores/i18n";
  import { IconNeuronsPage, PageBanner } from "@dfinity/gix-components";
</script>

<main data-tid="staking-component">
  {#if !$authSignedInStore}
    <PageBanner testId="staking-page-banner">
      <IconNeuronsPage slot="image" />
      <svelte:fragment slot="title">{$i18n.staking.title}</svelte:fragment>
      <p class="description" slot="description">{$i18n.staking.text}</p>
      <SignIn slot="actions" />
    </PageBanner>
  {/if}

  <ProjectsTable />
</main>

<style lang="scss">
  @use "@dfinity/gix-components/dist/styles/mixins/media";

  main {
    display: flex;
    flex-direction: column;
    gap: var(--padding-2x);

    @include media.min-width(large) {
      width: var(--island-width);
    }
  }
</style>
