<script lang="ts">
  import IconStarFill from "$lib/components/ui/icons/IconStarFill.svelte";
  import { snsFavProjectsToggleVisibleStore } from "$lib/derived/sns-fav-projects.derived";
  import { i18n } from "$lib/stores/i18n";
  import { snsFavProjectsVisibilityStore } from "$lib/stores/sns-fav-projects-visibility.store";
  import { IconStar } from "@dfinity/gix-components";

  let checked = $derived($snsFavProjectsVisibilityStore === "fav");
  const Icon = $derived(checked ? IconStarFill : IconStar);

  const toggle = () => {
    const newState = checked ? "all" : "fav";
    snsFavProjectsVisibilityStore.set(newState);
    // TODO(launchpad2): Add analytics event for this toggle
    // analytics.event("fav-projects-only-toggle", {
    //   value: newState,
    // });
  };
</script>

{#if $snsFavProjectsToggleVisibleStore}
  <button
    class="wrapper"
    onclick={toggle}
    aria-label={$i18n.launchpad.toggle_fav_only}
    title={$i18n.launchpad.toggle_fav_only}
    data-tid="toggle-fav-projects-only-component"
  >
    <Icon />
  </button>
{/if}

<style lang="scss">
  button {
    min-width: 40px;
    min-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    border: 1.5px solid var(--primary);
    color: var(--primary);
  }
</style>
