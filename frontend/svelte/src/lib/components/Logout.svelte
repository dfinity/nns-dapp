<script lang="ts">
  import { authStore } from "../stores/auth.store";

  const logout = async () => {
    await authStore.signOut();

    window.location.replace(`/`);
  };
</script>

<button on:click={logout}>Logout</button>
