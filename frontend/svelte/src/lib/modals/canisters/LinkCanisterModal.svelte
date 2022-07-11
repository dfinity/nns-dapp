<script lang="ts">
  import AttachCanister from "../../components/canisters/AttachCanister.svelte";
  import { i18n } from "../../stores/i18n";
  import Modal from "../Modal.svelte";
</script>

<Modal on:nnsClose size="big">
  <svelte:fragment slot="title"
    ><span data-tid="link-canister-modal-title"
      >{$i18n.canisters.attach_canister}</span
    ></svelte:fragment
  >
  <section>
    <AttachCanister on:nnsClose />
  </section>
</Modal>

<style lang="scss">
  @use "../../themes/mixins/modal";
  section {
    @include modal.section;
  }
</style>
