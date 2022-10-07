<script lang="ts">
  import AttachCanister from "$lib/components/canisters/AttachCanister.svelte";
  import { i18n } from "$lib/stores/i18n";
  import LegacyModal from "$lib/modals/LegacyModal.svelte";
</script>

<LegacyModal on:nnsClose size="big">
  <svelte:fragment slot="title"
    ><span data-tid="link-canister-modal-title"
      >{$i18n.canisters.attach_canister}</span
    ></svelte:fragment
  >
  <section>
    <AttachCanister on:nnsClose />
  </section>
</LegacyModal>

<style lang="scss">
  @use "../../themes/mixins/modal";
  section {
    @include modal.section;
  }
</style>
