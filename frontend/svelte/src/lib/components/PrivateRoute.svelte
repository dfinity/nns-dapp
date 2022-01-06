<script lang="ts">
  import type { AuthStore } from '../stores/auth.store';
  import { authStore } from '../stores/auth.store';
  import { onDestroy, SvelteComponent } from 'svelte';
  import Route from './Route.svelte';
  import type { Unsubscriber } from 'svelte/types/runtime/store';
  import { appPath, routeContext, routePath } from '../utils/route.utils';

  export let path: string;
  export let component: typeof SvelteComponent;

  let signedIn: boolean = false;

  const redirectLogin = () => {
    if (signedIn || routePath() !== path) {
      return;
    }

    // Redirect to root, user needs to sign in
    window.location.replace(`${appPath()}/?redirect=${routeContext()}`);
  };

  const unsubscribe: Unsubscriber = authStore.subscribe(({ signedIn: loggedIn }: AuthStore) => {
    signedIn = loggedIn === true;

    redirectLogin();
  });

  onDestroy(unsubscribe);
</script>

{#if signedIn}
  <Route {path} {component} />
{/if}
