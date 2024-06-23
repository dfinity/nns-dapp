<script lang="ts">
  import PrincipalInput from "$lib/components/ui/PrincipalInput.svelte";
  import { i18n } from "$lib/stores/i18n";
  import { busy } from "@dfinity/gix-components";
  import type { Principal } from "@dfinity/principal";
  import { createEventDispatcher } from "svelte";

  export let principal: Principal | undefined = undefined;

  const dispatcher = createEventDispatcher();
  const select = () => {
    dispatcher("nnsSelectPrincipal");
  };
</script>

<form on:submit|preventDefault={select} data-tid="add-principal-component">
  <div>
    <PrincipalInput
      bind:principal
      placeholderLabelKey="core.principal_id"
      name="principal"
    >
      <slot name="title" slot="label" />
    </PrincipalInput>
  </div>

  <div class="toolbar">
    <button
      class="secondary"
      type="button"
      data-tid="cancel-button"
      on:click={() => dispatcher("nnsClose")}
    >
      {$i18n.core.cancel}
    </button>
    <button
      data-tid="add-principal-button"
      class="primary"
      type="submit"
      disabled={principal === undefined || $busy}
    >
      <slot name="button" />
    </button>
  </div>
</form>
