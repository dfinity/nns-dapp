

@JS()
library dfinity_agent.js;

import 'package:js/js.dart';

import '../models.dart';
import 'js_utils.dart';

@JS("GovernanceApi")
class GovernanceApi {
  external factory GovernanceApi(String host, dynamic identity);

  @JS("getNeurons")
  external Promise<dynamic> getNeurons();

  @JS("getPendingProposals")
  external Promise<dynamic> getPendingProposals();

  @JS("getProposalInfo")
  external Promise<dynamic> getProposalInfo(BigInt proposalId);

  @JS("listProposals")
  external Promise<dynamic> listProposals(dynamic request);

  @JS("addHotKey")
  external Promise<dynamic> addHotKey(dynamic request);

  @JS("removeHotKey")
  external Promise<dynamic> removeHotKey(dynamic request);

  @JS("startDissolving")
  external Promise<dynamic> startDissolving(dynamic request);

  @JS("stopDissolving")
  external Promise<dynamic> stopDissolving(dynamic request);

  @JS("increaseDissolveDelay")
  external Promise<dynamic> increaseDissolveDelay(dynamic request);

  @JS("follow")
  external Promise<dynamic> follow(dynamic request);

  @JS("registerVote")
  external Promise<dynamic> registerVote(dynamic request);

  @JS("spawn")
  external Promise<dynamic> spawn(dynamic request);

  @JS("split")
  external Promise<dynamic> split(dynamic request);

  @JS("disburse")
  external Promise<dynamic> disburse(dynamic request);

  @JS("disburseToNeuron")
  external Promise<dynamic> disburseToNeuron(dynamic request);

  @JS("makeMotionProposal")
  external Promise<dynamic> makeMotionProposal(dynamic request);
}
