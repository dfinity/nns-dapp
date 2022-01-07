<script lang="ts">
  import { authStore } from "../stores/auth.store";
  import { appPath } from "../utils/route.utils";

  const logout = async () => {
    await authStore.signOut();

    window.location.replace(`${appPath()}/`);
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
