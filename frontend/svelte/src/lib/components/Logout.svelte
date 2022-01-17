<script lang="ts">
  import { authStore } from "../stores/auth.store";

  const logout = async () => {
    await authStore.signOut();

    // The current active <PrivateRoute/> takes care of the redirection to root path "/"

    window.localStorage.clear();
  };
</script>

<button on:click={logout}>Logout</button>

<style lang="scss">
  button {
    z-index: 1;

    width: fit-content;
    justify-self: flex-end;

    margin: 0 var(--padding);

    color: white;

    &:hover {
      text-decoration: underline;
    }
  }
</style>
