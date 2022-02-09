<script lang="ts">
  import Wizard from "../../../../lib/components/ui/Wizard/Wizard.svelte";
  import WizardStep from "../../../../lib/components/ui/Wizard/WizardStep.svelte";

  let wizard: Wizard | undefined;

  export function next() {
    wizard.next();
  }

  export function back() {
    wizard.back();
  }
</script>

<Wizard bind:this={wizard}>
  <WizardStep index={0}>
    <div>First</div>
  </WizardStep>
  <WizardStep index={1}>
    <div>Second</div>
  </WizardStep>
  <WizardStep index={2}>
    <div>Third</div>
  </WizardStep>
</Wizard>
