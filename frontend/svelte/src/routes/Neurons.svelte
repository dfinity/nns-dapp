<script lang="ts">
  import Layout from "../lib/components/Layout.svelte";
  import { onDestroy, onMount } from "svelte";
  import type { Unsubscriber } from "svelte/types/runtime/store";
  import { AuthStore, authStore } from "../lib/stores/auth.store";

  onMount(() => {
    if (process.env.REDIRECT_TO_LEGACY) {
      window.location.replace("/#/neurons");
    }
  });

  let principalText: string = "";

  const unsubscribe: Unsubscriber = authStore.subscribe(
    ({ principal }: AuthStore) => (principalText = principal?.toText() ?? "")
  );

  onDestroy(unsubscribe);
</script>

<Layout>
  <section>
    <h1>Neurons</h1>

    <p>
      Earn rewards by staking your ICP in neurons. Neurons allow you to
      participate in governance on the Internet Computer by voting on Network
      Nervous System (NNS) proposals.
    </p>

    <p>
      Your principal id is "{principalText}"
    </p>
  </section>
</Layout>
