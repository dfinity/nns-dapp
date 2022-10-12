<script lang="ts">
  import type { Principal } from "@dfinity/principal";
  import { busy } from "$lib/stores/busy.store";
  import PrincipalInput from "$lib/components/ui/PrincipalInput.svelte";
  import { createEventDispatcher } from "svelte";
  import { i18n } from "$lib/stores/i18n";

  export let principal: Principal | undefined = undefined;

  const dispatcher = createEventDispatcher();
  const select = () => {
    dispatcher("nnsSelectPrincipal");
  };
</script>

<form on:submit|preventDefault={select}>
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