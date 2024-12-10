<script lang="ts">
  import { beforeNavigate } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";
  import { i18n } from "$lib/stores/i18n";
  import { IconSettings } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  const dispatcher = createEventDispatcher();
  const linkToSettings = AppPath.Settings;

  beforeNavigate(() => dispatcher("nnsLink"));
</script>

<a data-tid="settings" href={linkToSettings} class="text">
  <IconSettings />
  {$i18n.navigation.settings}
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
