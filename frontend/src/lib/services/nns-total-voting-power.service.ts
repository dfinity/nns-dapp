import { queryProposals } from "$lib/api/proposals.api";
import { getCurrentIdentity } from "$lib/services/auth.services";
import { nnsTotalVotingPower } from "$lib/stores/nns-total-voting-power.store";

export const loadNnsTotalVotingPower = async (): Promise<void> => {
  const proposals = await queryProposals({
    beforeProposal: undefined,
    identity: getCurrentIdentity(),
    certified: false,
  });

  // @TODO UPDATE WITH REAL API DATA
  nnsTotalVotingPower.set(
    proposals[0]?.totalPotentialVotingPower || BigInt(50_276_005_084_190_970)
  );
};
