import { queryProposals } from "$lib/api/proposals.api";
import { getCurrentIdentity } from "$lib/services/auth.services";
import { nnsTotalVotingPower } from "$lib/stores/nns-total-voting-power.store";

export const loadNnsTotalVotingPower = async (): Promise<void> => {
  const _proposals = await queryProposals({
    beforeProposal: undefined,
    identity: getCurrentIdentity(),
    certified: false,
  });

  // nnsTotalVotingPower.set(proposals[0].totalVotingPower || 0n);
  // @TODO UPDATE WITH REAL API DATA
  nnsTotalVotingPower.set(0n);
};
