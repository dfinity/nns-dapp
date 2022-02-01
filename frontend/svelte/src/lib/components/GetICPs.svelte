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

<button on:click={() => (visible = true)} class="open">Get ICPs</button>

<Modal {visible} on:nnsClose={() => (visible = false)}>
  <span slot="title">Get ICPs</span>

  <form on:submit|preventDefault={onSubmit}>
    <span class="how-much">How much?</span>

    <Input placeholderLabelKey="core.icp" name="icp" bind:value={inputValue} />

    <button type="submit" class="submit" disabled={validForm}>Get</button>
  </form>
</Modal>

<style lang="scss">
  @use "../themes/mixins/button";

  .open {
    @include button.header;

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

  .submit {
    border-radius: var(--border-radius);
    margin: var(--padding) 0;

    background: var(--gray-50);
    color: var(--gray-400);

    &:not([disabled]) {
      &:hover {
        background: var(--blue-500-tint)
          radial-gradient(circle, transparent 1%, var(--blue-500-tint) 1%)
          center/15000%;
      }

      &:active {
        background-color: var(--gray-100);
        background-size: 100%;
        transition: background 0s;
      }

      background: var(--blue-500);
      color: var(--blue-500-contrast);

      background-position: center;
      transition: background 0.8s;
    }
  }
</style>
