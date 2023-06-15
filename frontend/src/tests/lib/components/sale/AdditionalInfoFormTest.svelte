<script lang="ts">
  import AdditionalInfoForm from "$lib/components/sale/AdditionalInfoForm.svelte";
  import type { Writable } from "svelte/store";

  export let conditionsToAccept: string | undefined;
  export let areConditionsAcceptedStore: Writable<boolean>;
  let areConditionsAccepted = false;

  $: areConditionsAcceptedStore &&
    areConditionsAcceptedStore.set(areConditionsAccepted);
</script>

<AdditionalInfoForm bind:areConditionsAccepted {conditionsToAccept} />
