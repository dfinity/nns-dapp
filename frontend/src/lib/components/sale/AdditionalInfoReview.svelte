<script lang="ts">
  import { Checkbox } from "@dfinity/gix-components";
  import { i18n } from "$lib/stores/i18n";

  export let accepted = false;
  const toggleAccept = () => (accepted = !accepted);
</script>

<Checkbox
  testId="additional-info-review-component"
  text="block"
  inputId="agree"
  checked={accepted}
  on:nnsChange={toggleAccept}
  --checkbox-align-items="flex-start"
  --checkbox-label-order="1"
  --checkbox-padding="var(--padding)"
>
  {$i18n.sns_project_detail.understand_agree}
</Checkbox>
