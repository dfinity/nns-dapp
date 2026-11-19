<script lang="ts">
  import Input from "$lib/gix/components/Input.svelte";

  interface Props {
    name: string;
    placeholder?: string;
    ariaLabel?: string;
  }

  let { name, placeholder = "test.placeholder", ariaLabel }: Props = $props();

  let inputField = $state<HTMLInputElement | undefined>();

  const changeFocus = () => {
    inputField?.focus();
  };
</script>

<button id="test" aria-label={ariaLabel} onclick={changeFocus}></button>

<Input {name} {placeholder} bind:inputElement={inputField} />
