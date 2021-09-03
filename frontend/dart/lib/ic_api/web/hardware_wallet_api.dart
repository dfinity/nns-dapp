@JS()
library ic_agent.js;

import 'package:js/js.dart';

import 'js_utils.dart';

@JS("createHardwareWalletApi")
external Promise<HardwareWalletApi> createHardwareWalletApi(dynamic identity);

@JS("HardwareWalletApi")
class HardwareWalletApi {
  @JS("showAddressAndPubKeyOnDevice")
  external Promise<void> showAddressAndPubKeyOnDevice();

  @JS("createNeuron")
  external Promise<String> createNeuron(dynamic amount);

  @JS("addHotKey")
  external Promise<dynamic> addHotKey(dynamic neuronId, String principal);
}
