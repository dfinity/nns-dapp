<script lang="ts">
    import {authStore} from "../stores/auth.store";
</script>

{#await authStore.init()}
    <!-- TODO: display a spinner or other animation while loading the auth? -->
{:then value}
    <!-- promise was fulfilled -->
    <slot />
{:catch error}
    <!-- TODO: do we display the error? {error.message} -->
{/await}
