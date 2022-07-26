<script lang="ts">
  import type { Principal } from "@dfinity/principal";
  import { busy } from "../../stores/busy.store";
  import PrincipalInput from "../../components/ui/PrincipalInput.svelte";
  import { createEventDispatcher } from "svelte";
  import FooterModal from "../../modals/FooterModal.svelte";
  import { i18n } from "../../stores/i18n";

  export let principal: Principal | undefined = undefined;

  const dispatcher = createEventDispatcher();
  const select = () => {
    dispatcher("nnsSelectPrincipal");
  };
</script>

<form on:submit|preventDefault={select}>
  <div class="input-wrapper">
    <h5><slot name="title" /></h5>
    <PrincipalInput
      bind:principal
      placeholderLabelKey="core.principal_id"
      name="principal"
    />
  </div>

  <FooterModal>
    <button
      class="secondary small"
      type="button"
      on:click={() => dispatcher("nnsClose")}
    >
      {$i18n.core.cancel}
    </button>
    <button
      data-tid="add-principal-button"
      class="primary small"
      type="submit"
      disabled={principal === undefined || $busy}
    >
      <slot name="button" />
    </button>
  </FooterModal>
</form>

<style lang="scss">
  h5 {
    text-align: center;
  }

  form {
    max-width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  .input-wrapper {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
</style>
