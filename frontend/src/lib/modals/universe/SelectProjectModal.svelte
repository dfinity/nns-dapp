<script lang="ts">
  import { Modal } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import SelectProjectNavList from "$lib/components/universe/SelectProjectNavList.svelte";

  export let selectedCanisterId: string;
</script>

<Modal on:nnsClose>
  <span slot="title">{$i18n.core.pick_a_project}</span>

  <SelectProjectNavList {selectedCanisterId} icon="check" />
</Modal>