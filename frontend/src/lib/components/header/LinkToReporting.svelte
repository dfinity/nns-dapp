<script lang="ts">
  import { beforeNavigate } from "$app/navigation";
  import { AppPath } from "$lib/constants/routes.constants";
  import { i18n } from "$lib/stores/i18n";
  import { IconDocument } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  const dispatcher = createEventDispatcher();
  const linkToReporting = AppPath.Reporting;

  beforeNavigate(() => dispatcher("nnsLink"));
</script>

<a data-tid="reporting" href={linkToReporting} class="text">
  <IconDocument />
  {$i18n.navigation.reporting}
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
