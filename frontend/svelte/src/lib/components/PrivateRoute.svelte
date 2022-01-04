<script lang="ts">
    import type {AuthStore} from '../stores/auth.store';
    import {authStore} from '../stores/auth.store';
    import {SvelteComponent} from 'svelte';
    import Route from "./Route.svelte";

    export let path: string;
    export let component: SvelteComponent;

    let signedIn: boolean = false;

    authStore.subscribe(({signedIn: loggedIn}: AuthStore) => signedIn = loggedIn === true);
</script>

{#if signedIn}
    <Route {path} {component} />
{/if}
