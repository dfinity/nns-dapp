<script lang="ts">
  import CardInfo from "../ui/CardInfo.svelte";
  import Separator from "../ui/Separator.svelte";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import { SnsNeuronPermissionType, type SnsNeuron } from "@dfinity/sns";
  import TagsList from "../ui/TagsList.svelte";
  import Hash from "../ui/Hash.svelte";
  import { Tag } from "@dfinity/gix-components";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { getContext } from "svelte";

  const { store }: SelectedSnsNeuronContext =
    getContext<SelectedSnsNeuronContext>(SELECTED_SNS_NEURON_CONTEXT_KEY);

  let neuron: SnsNeuron | undefined | null = $store.neuron;

  const openAddPermissionsModal = async () => {
    openSnsNeuronModal({ type: "dev-add-permissions" });
  };
  const openRemovePermissionsModal = async () => {
    openSnsNeuronModal({ type: "dev-remove-permissions" });
  };
</script>

<!-- ONLY FOR TESTNET. NO UNIT TESTS -->
<CardInfo>
  <h3 slot="start">Permissions TESTNET ONLY</h3>

  {#each neuron?.permissions || [] as permission}
    <TagsList id="permissions">
      <Hash
        text={permission.principal[0]?.toText() ?? ""}
        id={permission.principal[0]?.toText() ?? ""}
        tagName="h5"
        slot="title"
      />
      {#each permission.permission_type as permissionType}
        <Tag tagName="li">{SnsNeuronPermissionType[permissionType]}</Tag>
      {/each}
    </TagsList>
  {/each}

  <div>
    <button on:click={openAddPermissionsModal} class="primary"
      >Add Permissions</button
    >
    &nbsp;
    <button on:click={openRemovePermissionsModal} class="primary"
      >Remove Permissions</button
    >
  </div>
</CardInfo>

<Separator />

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
  }

  div {
    display: flex;
    justify-content: flex-start;
  }
</style>
