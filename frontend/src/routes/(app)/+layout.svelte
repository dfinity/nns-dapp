<script lang="ts">
  import { confirmToCloseBrowser } from "$lib/utils/before-unload.utils";
  import { onMount } from "svelte";
  import { Toasts, BusyScreen } from "@dfinity/gix-components";
  import {
    initAppAuth,
    initAppPublicData,
  } from "$lib/services/$public/app.services";
  import Warnings from "$lib/components/metrics/Warnings.svelte";
  import {confirmBeforeCloseStore} from "$lib/derived/before-unload.derived";

  onMount(async () => await Promise.all([initAppAuth(), initAppPublicData()]));

  $: confirmToCloseBrowser($confirmBeforeCloseStore);
</script>

<slot />

<Warnings />

<Toasts />
<BusyScreen />
