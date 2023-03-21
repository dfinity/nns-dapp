<script lang="ts">
  import { goto } from "$app/navigation";
  import { i18n } from "$lib/stores/i18n";
  import { IconSettings } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  const dispatcher = createEventDispatcher();
</script>

<button
  data-tid="settings"
  on:click={async () => {
    await goto("/settings");
    dispatcher("nnsLink");
  }}
  class="text"
>
  <IconSettings />
  {$i18n.navigation.settings}
</button>

<style lang="scss">
  @use "../../themes/mixins/account-menu";

  button {
    @include account-menu.button;
  }
</style>
