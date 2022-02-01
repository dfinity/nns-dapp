<script lang="ts">
  import Modal from "../modals/Modal.svelte";
  import Input from "./Input.svelte";

  let visible: boolean;
</script>

<button on:click={() => visible = true} class="open">Get ICPs</button>

<Modal {visible} on:nnsClose={() => visible = false}>
  <span slot="title">Get ICPs</span>

  <form>
    <span>How much?</span>

    <Input placeholderLabelKey="core.icp" />

    <button>Get</button>
  </form>
</Modal>

<style lang="scss">
  @use "../themes/mixins/button";

  .open {
    @include button.header;

    justify-self: flex-start;
  }

  form {
    display: flex;
    flex-direction: column;

    padding: calc(2 * var(--padding));
  }
</style>
