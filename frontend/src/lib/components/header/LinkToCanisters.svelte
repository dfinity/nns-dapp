<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconExplore } from "@dfinity/gix-components";
  import { goto } from "$app/navigation";
  import { createEventDispatcher } from "svelte";
  import { AppPath } from "$lib/constants/routes.constants";

  const dispatcher = createEventDispatcher();

  function navigateToCanisters(event: MouseEvent) {
    event.preventDefault();
    goto(AppPath.Canisters);
    dispatcher("closeMenu");
  }
</script>

<a
  data-tid="canisters-button"
  href={AppPath.Canisters}
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
