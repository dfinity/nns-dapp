<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconExplore } from "@dfinity/gix-components";
  import { goto } from "$app/navigation";
  import { createEventDispatcher } from "svelte";
  import { canistersPathStore } from "$lib/derived/paths.derived";

  const dispatcher = createEventDispatcher();

  function navigateToCanisters(event: MouseEvent) {
    event.preventDefault();
    goto($canistersPathStore);
    dispatcher("closeMenu");
  }
</script>

<a
  data-tid="canisters-button"
  href={$canistersPathStore}
  on:click={navigateToCanisters}
  class="text"
>
  <IconExplore />
  {$i18n.navigation.canisters}
</a>

<style lang="scss">
  @use "../../themes/mixins/account-menu";

  a {
    @include account-menu.button;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
</style>
