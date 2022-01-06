<script lang="ts">
  import { authStore } from '../stores/auth.store';
  import { appPath } from '../utils/route.utils';

  const logout = async () => {
    await authStore.signOut();

    window.location.replace(`${appPath()}/`);
  };
</script>

<button on:click={logout}>Logout</button>
