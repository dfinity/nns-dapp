<script lang="ts">
  import { authStore } from "../stores/auth.store";
  import { i18n } from "../stores/i18n";

  const logout = async () => {
    await authStore.signOut();

    window.localStorage.clear();

    // We reload the page to make sure all the states are cleared
    window.location.reload();
  };
</script>

<button on:click={logout} class="text">{$i18n.header.logout}</button>

<style lang="scss">
  button {
    justify-self: flex-end;
  }
</style>
