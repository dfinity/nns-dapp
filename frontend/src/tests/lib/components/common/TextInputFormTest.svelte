<script lang="ts">
  import TextInputForm from "$lib/components/common/TextInputForm.svelte";

  export let text: string | undefined = undefined;
  export let placeholderLabelKey: string;
  export let disabledInput = false;
  export let disabledConfirm = false;
  export let errorMessage: string | undefined = undefined;
  export let testId: string | undefined = undefined;
  export let required = true;
</script>

<TextInputForm
  {text}
  {placeholderLabelKey}
  {disabledInput}
  {disabledConfirm}
  {errorMessage}
  {testId}
  {required}
  on:nnsClose
  on:nnsConfirmText
>
  <span slot="cancel-text">Cancel</span>
</TextInputForm>
