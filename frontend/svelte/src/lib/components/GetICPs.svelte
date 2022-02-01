<script lang="ts">
  import Modal from "../modals/Modal.svelte";
  import Input from "./Input.svelte";

  let visible: boolean;

  let inputValue: number | undefined = undefined;

  const onSubmit = ({ target }) => {
    const formData: FormData = new FormData(target);

    for (var [key, value] of formData.entries()) {
      console.log(key, value);
    }
  };

  let validForm: boolean;

  $: validForm = inputValue === undefined || inputValue <= 0;
</script>

<button on:click={() => (visible = true)} class="open text">Get ICPs</button>

<Modal {visible} on:nnsClose={() => (visible = false)}>
  <span slot="title">Get ICPs</span>

  <form on:submit|preventDefault={onSubmit}>
    <span class="how-much">How much?</span>

    <Input placeholderLabelKey="core.icp" name="icp" bind:value={inputValue} />

    <button type="submit" class="submit" disabled={validForm}>Get</button>
  </form>
</Modal>

<style lang="scss">
  .open {
    justify-self: flex-start;
  }

  .how-much {
    margin-bottom: calc(var(--padding) / 2);
  }

  form {
    display: flex;
    flex-direction: column;

    padding: calc(2 * var(--padding));
  }
</style>
