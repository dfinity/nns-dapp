<script lang="ts">
  import { Modal } from "@dfinity/gix-components";
  import SaleInProgress from "$lib/components/sale/SaleInProgress.svelte";
  import type { SaleStep } from "$lib/types/sale";
  import { i18n } from "$lib/stores/i18n";

  export let progressStep: SaleStep;
</script>

<Modal disablePointerEvents testId="sale-in-progress-modal">
  <svelte:fragment slot="title"
    >{$i18n.sns_sale.participation_in_progress}</svelte:fragment
  >
  <SaleInProgress {progressStep} />
</Modal>
