<script lang="ts">
    import { isSignedIn } from "$lib/utils/auth.utils";
    import { authStore } from "$lib/stores/auth.store";
    import SignIn from "$lib/components/common/SignIn.svelte";
    import {i18n} from "$lib/stores/i18n";

    let signedIn = false;
    $: signedIn = isSignedIn($authStore.identity);
</script>

{#if signedIn}
    <slot />
    {:else}
    <SignIn >
        <slot name="signin-cta" >{$i18n.auth.login}</slot>
    </SignIn>
    {/if}