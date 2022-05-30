<script>
  import { i18n } from "../../stores/i18n";
  import Card from "../ui/Card.svelte";

  // TODO: UI - https://dfinity.atlassian.net/browse/L2-599
  // TODO: Add Controller - https://dfinity.atlassian.net/browse/L2-600
  // TODO: Remove Controller - https://dfinity.atlassian.net/browse/L2-601
</script>

<Card testId="canister-controllers-card">
  <h4 slot="start">{$i18n.canister_detail.controllers}</h4>
</Card>
