<script lang="ts">
    import {SvelteComponent} from 'svelte';

    export let path: string;
    export let component: SvelteComponent;

    const routePath = (): string => window.location.hash.slice(2).split("/")[0].toLowerCase();

    // Get the current route from the location hash to lower case. Example: #/ICP => icp
    let currentPath: string = routePath();
</script>

<svelte:window on:hashchange={() => currentPath = routePath()}/>

{#if path === currentPath}
    <svelte:component this={component}/>
{/if}
