<script lang="ts">
  import LinkCanister from "$lib/components/canisters/LinkCanister.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { Modal } from "@dfinity/gix-components";
</script>

<Modal on:nnsClose>
  <svelte:fragment slot="title"
    ><span data-tid="link-canister-modal-title"
      >{$i18n.canisters.link_canister}</span
    ></svelte:fragment
  >

  <LinkCanister on:nnsClose />
</Modal>
