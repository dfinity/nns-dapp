<script lang="ts">
  import AttachCanister from "$lib/components/canisters/AttachCanister.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { Modal } from "@dfinity/gix-components";
</script>

<Modal on:nnsClose>
  <svelte:fragment slot="title"
    ><span data-tid="link-canister-modal-title"
      >{$i18n.canisters.attach_canister}</span
    ></svelte:fragment
  >

  <AttachCanister on:nnsClose />
</Modal>
