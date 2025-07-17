import { queryProposals } from "$lib/api/proposals.api";
import { getCurrentIdentity } from "$lib/services/auth.services";
import { nnsTotalVotingPowerStore } from "$lib/stores/nns-total-voting-power.store";

export const loadNnsTotalVotingPower = async (): Promise<void> => {
  const proposals = await queryProposals({
    beforeProposal: undefined,
    identity: getCurrentIdentity(),
    certified: false,
  });

  nnsTotalVotingPowerStore.set(proposals[0]?.totalPotentialVotingPower ?? 0n);
};
