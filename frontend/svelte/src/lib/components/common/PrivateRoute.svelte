<script lang="ts">
  import type { AuthStore } from "../../stores/auth.store";
  import { authStore } from "../../stores/auth.store";
  import { onDestroy, SvelteComponent } from "svelte";
  import Route from "./Route.svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { routeContext, routePath } from "../../utils/route.utils";
  import { routeStore } from "../../stores/route.store";
  import { isSignedIn } from "../../utils/auth.utils";
  import { isRoutePath } from "../../utils/app-path.utils";
  import type { AppPath } from "../../constants/routes.constants";

  export let path: AppPath;
  export let component: typeof SvelteComponent;

  let signedIn: boolean = false;

  const redirectLogin = () => {
    if (signedIn || !isRoutePath({ path, routePath: routePath() })) {
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
  <Route {path} {component} />
{/if}
