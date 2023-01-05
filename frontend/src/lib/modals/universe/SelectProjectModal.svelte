<script lang="ts">
  import { Modal } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import SelectProjectList from "$lib/components/universe/SelectProjectList.svelte";

  export let selectedCanisterId: string;
</script>

<Modal on:nnsClose>
  <span slot="title">{$i18n.core.pick_a_project}</span>

  <SelectProjectList {selectedCanisterId} role="button" />
</Modal>
