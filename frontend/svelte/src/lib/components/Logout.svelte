<script lang="ts">
  import { authStore } from "../stores/auth.store";

  const logout = async () => {
    await authStore.signOut();

    window.localStorage.clear();

    // We reload the page to make sure all the states are cleared
    window.location.reload();
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
