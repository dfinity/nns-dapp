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

  const select = async (canisterId: string) => {
    await goto(buildSwitchUniverseUrl(canisterId));
    close();
  };
</script>

<Modal testId="select-universe-modal" on:nnsClose>
  <span slot="title">{$i18n.universe.select_token}</span>

  <SelectUniverseList
    {selectedCanisterId}
    role="button"
    on:nnsSelectProject={({ detail }) => select(detail)}
  />
</Modal>
