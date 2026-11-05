<script lang="ts">
  import { beforeNavigate } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";
  import { i18n } from "$lib/stores/i18n";
  import { IconKey } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  const dispatcher = createEventDispatcher();
  const linkToHotkeys = AppPath.Hotkeys;

  beforeNavigate(() => dispatcher("nnsLink"));
</script>

<a data-tid="hotkeys" href={linkToHotkeys} class="text">
  <IconKey />
  {$i18n.navigation.hotkeys}
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
