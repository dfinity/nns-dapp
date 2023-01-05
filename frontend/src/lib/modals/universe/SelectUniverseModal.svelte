<script lang="ts">
  import { Modal } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";
  import SelectUniverseList from "$lib/components/universe/SelectUniverseList.svelte";
  import { createEventDispatcher } from "svelte";
  import { goto } from "$app/navigation";
  import { buildSwitchUniverseUrl } from "$lib/utils/navigation.utils";

  export let selectedCanisterId: string;

  const dispatcher = createEventDispatcher();
  const close = () => dispatcher("nnsClose");

  const select = async () => {
    await goto(buildSwitchUniverseUrl(selectedCanisterId));
    close();
  };
</script>

<Modal on:nnsClose>
  <span slot="title">{$i18n.universe.pick_a_token}</span>

  <SelectUniverseList
    {selectedCanisterId}
    role="button"
    on:nnsSelectProject={({ detail }) => (selectedCanisterId = detail)}
  />

  <div class="toolbar">
    <button class="secondary" type="button" on:click={close}>
      {$i18n.core.cancel}
    </button>

    <button class="primary" type="button" on:click={select}>
      {$i18n.universe.select}
    </button>
  </div>
</Modal>
