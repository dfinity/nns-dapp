<script lang="ts">
  import { Modal } from "@dfinity/gix-components";
  import SelectUniverseList from "$lib/components/universe/SelectUniverseList.svelte";
  import { createEventDispatcher } from "svelte";
  import { goto } from "$app/navigation";
  import { buildSwitchUniverseUrl } from "$lib/utils/navigation.utils";
  import { titleTokenSelectorStore } from "$lib/derived/title-token-selector.derived";

  const dispatcher = createEventDispatcher();
  const close = () => dispatcher("nnsClose");

  const select = async (canisterId: string) => {
    await goto(buildSwitchUniverseUrl(canisterId));
    close();
  };
</script>

<Modal testId="select-universe-modal" on:nnsClose>
  <span slot="title" data-tid="select-universe-modal-title"
    >{$titleTokenSelectorStore}</span
  >

  <SelectUniverseList
    role="button"
    on:nnsSelectUniverse={({ detail }) => select(detail)}
  />
</Modal>
