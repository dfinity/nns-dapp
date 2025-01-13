<script lang="ts">
  import CardInfo from "$lib/components/ui/CardInfo.svelte";
  import Hash from "$lib/components/ui/Hash.svelte";
  import TagsList from "$lib/components/ui/TagsList.svelte";
  import {
    SELECTED_SNS_NEURON_CONTEXT_KEY,
    type SelectedSnsNeuronContext,
  } from "$lib/types/sns-neuron-detail.context";
  import { openSnsNeuronModal } from "$lib/utils/modals.utils";
  import { Tag } from "@dfinity/gix-components";
  import { SnsNeuronPermissionType, type SnsNeuron } from "@dfinity/sns";
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
<CardInfo noMargin>
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

<style lang="scss">
  h3 {
    line-height: var(--line-height-standard);
  }

  div {
    display: flex;
    justify-content: flex-start;
  }
</style>
