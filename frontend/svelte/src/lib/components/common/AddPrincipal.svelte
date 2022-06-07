<script lang="ts">
  import type { Principal } from "@dfinity/principal";
  import { busy } from "../../stores/busy.store";
  import PrincipalInput from "../../components/ui/PrincipalInput.svelte";
  import { createEventDispatcher } from "svelte";

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

  <button
    data-tid="add-principal-button"
    class="primary full-width"
    type="submit"
    disabled={principal === undefined || $busy}
  >
    <slot name="button" />
  </button>
</form>

<style lang="scss">
  @use "../../themes/mixins/modal.scss";

  h5 {
    text-align: center;
  }

  form {
    @include modal.section;
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
