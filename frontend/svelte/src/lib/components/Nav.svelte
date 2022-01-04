<script lang="ts">
    import {routePath} from '../utils/route.utils';

    let currentPath: string = routePath();

    const routes: {path: string, label: string}[] = [
        {path: '/#/accounts', label: 'ICP'},
        {path: '/#/neurons', label: 'NEURONS'},
        {path: '/#/voting', label: 'VOTING'},
        {path: '/#/canisters', label: '</a>'}
    ];
</script>

<nav>
    {#each routes as { path, label }}
        <a href={path} class:active={currentPath === path}>{label}</a>
    {/each}
</nav>

<style lang="scss">
    nav {
      margin: var(--padding) calc(2 * var(--padding));

      display: flex;
      justify-content: space-around;

      background: var(--background);

      --border-radius: 16px;

      border-radius: var(--padding);
    }

    a {
      height: calc(100% - 2 * var(--padding));
    }

    .active {
      background: var(--blue);
      color: var(--blue-contrast);
    }
</style>
