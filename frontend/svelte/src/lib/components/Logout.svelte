<script lang="ts">
    import {authStore} from "../stores/auth.store";

    const logout = async () => {
        await authStore.signOut();

        window.location.replace(`/`);
    }
</script>

<button on:click={logout}>Logout</button>

<style lang="scss">
    button {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translate(-50%, -50%);
    }
</style>
