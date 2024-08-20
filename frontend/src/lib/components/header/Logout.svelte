<script lang="ts">
  import { logout } from "$lib/services/auth.services";
  import { i18n } from "$lib/stores/i18n";
  import { IconLogout } from "@dfinity/gix-components";
  import { createEventDispatcher } from "svelte";

  const dispatcher = createEventDispatcher();

  const signOut = () => {
    dispatcher("nnsLogoutTriggered");
    logout({});
  };
</script>

<button data-tid="logout" on:click={signOut} class="text">
  <IconLogout />
  {$i18n.header.logout}
</button>

<style lang="scss">
  @use "../../themes/mixins/account-menu";

  button {
    @include account-menu.button;
    padding: 0;
  }
</style>
