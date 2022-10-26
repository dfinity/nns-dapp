<script lang="ts">
  import Layout from "$lib/components/common/Layout.svelte";
  import { voteRegistrationStore } from "$lib/stores/vote-registration.store";
  import { syncBeforeUnload } from "$lib/utils/before-unload.utils";
  import { voteRegistrationActive } from "$lib/utils/proposals.utils";
  import { onDestroy } from "svelte";
  import { Toasts } from "@dfinity/gix-components";
  import BusyScreen from "$lib/components/ui/BusyScreen.svelte";

  const unsubscribeVoteInProgress = voteRegistrationStore.subscribe(
    ({ registrations }) =>
      syncBeforeUnload(voteRegistrationActive(registrations))
  );

  onDestroy(() => unsubscribeVoteInProgress());
</script>

<Layout>
  <slot />
</Layout>

<Toasts />
<BusyScreen />
