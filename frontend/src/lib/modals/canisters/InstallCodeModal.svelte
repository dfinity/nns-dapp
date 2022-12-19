<script lang="ts">
  import { Modal } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import InstallWasmCode from "$lib/components/canisters/InstallWasmCode.svelte";
  import type { Principal } from "@dfinity/principal";

  export let canisterId: Principal;
</script>

<Modal on:nnsClose>
  <span slot="title">{$i18n.canister_detail.install_code}</span>

  <InstallWasmCode on:nnsClose {canisterId} />
</Modal>
