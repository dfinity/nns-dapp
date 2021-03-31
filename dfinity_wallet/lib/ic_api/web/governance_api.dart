

@JS()
library dfinity_agent.js;

import 'package:js/js.dart';

import '../models.dart';
import 'promise.dart';

@JS("GovernanceApi")
class GovernanceApi {
  external factory GovernanceApi(String host, dynamic identity);

  @JS("createNeuron")
  external Promise<void> createNeuron(dynamic request);

  @JS("manageNeuron")
  external Promise<dynamic> manageNeuron(dynamic request);

  @JS("getNeurons")
  external Promise<dynamic> getNeurons();

  @JS("getPendingProposals")
  external Promise<dynamic> getPendingProposals();
}
