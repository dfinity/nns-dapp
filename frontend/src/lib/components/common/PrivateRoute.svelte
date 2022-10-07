<script lang="ts">
  import type { AuthStore } from "$lib/stores/auth.store";
  import { authStore } from "$lib/stores/auth.store";
  import { onDestroy } from "svelte";
  import Route from "./Route.svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { routeContext, routePath } from "$lib/utils/route.utils";
  import { routeStore } from "$lib/stores/route.store";
  import { isSignedIn } from "$lib/utils/auth.utils";
  import { isRoutePath } from "$lib/utils/app-path.utils";
  import type { AppPath } from "$lib/constants/routes.constants";

  export let path: AppPath;

  let signedIn = false;

  const redirectLogin = () => {
    if (signedIn || !isRoutePath({ paths: [path], routePath: routePath() })) {
      return;
    }

    // Redirect to root, user needs to sign in
    // We replace the url to get the redirect query params after successful sign in, to redirect user to the current page
    // We do not navigate, i.e. push to browser history, because we do not want to stack this redirect in the back navigation
    routeStore.replace({
      path: "/",
      query: `redirect=${routeContext()}`,
    });
  };

  const unsubscribe: Unsubscriber = authStore.subscribe(
    ({ identity }: AuthStore) => {
      signedIn = isSignedIn(identity);

      redirectLogin();
    }
  );

  onDestroy(unsubscribe);
</script>

{#if signedIn}
  <Route {path} />
{/if}
