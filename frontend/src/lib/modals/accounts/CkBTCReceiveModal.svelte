<script lang="ts">
  import { KeyValuePair, Modal } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";

  export let btcAddress: string;
</script>

<Modal testId="ckbtc-receive-modal" on:nnsClose>
  <span slot="title">{$i18n.ckbtc.receive}</span>

  <KeyValuePair>
    <span slot="key" class="label">{$i18n.ckbtc.address}</span>
    <svelte:fragment slot="value">{btcAddress}</svelte:fragment>
  </KeyValuePair>
</Modal>
