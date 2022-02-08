<script lang="ts">
  import Wizard from "../../../../lib/components/ui/Wizard/Wizard.svelte";
  import WizardPanel from "../../../../lib/components/ui/Wizard/WizardPanel.svelte";

  export let selectedTabIndex: number;
</script>

<Wizard {selectedTabIndex}>
  <WizardPanel index={0}>
    <div>First</div>
  </WizardPanel>
  <WizardPanel index={1}>
    <div>Second</div>
  </WizardPanel>
  <WizardPanel index={2}>
    <div>Third</div>
  </WizardPanel>
</Wizard>
