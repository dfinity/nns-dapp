<script lang="ts">
  import { i18n } from "$lib/stores/i18n";
  import { IconExplore } from "@dfinity/gix-components";
  import { canistersPathStore } from "$lib/derived/paths.derived";
  import { createEventDispatcher } from "svelte";
  import { beforeNavigate } from "$app/navigation";

  const dispatcher = createEventDispatcher();

  beforeNavigate(() => dispatcher("nnsLink"));
</script>

<a data-tid="canisters-button" href={$canistersPathStore} class="text">
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
