@JS()
library ic_agent.js;

import 'package:dfinity_wallet/ic_api/web/service_api.dart';
import 'package:js/js.dart';

import 'js_utils.dart';

@JS("createHardwareWalletApi")
external Promise<HardwareWalletApi> createHardwareWalletApi(
    dynamic identity, dynamic mainIdentity);

@JS("HardwareWalletApi")
class HardwareWalletApi {
  @JS("sendICPTs")
  external Promise<void> sendICPTs(
      String fromAccount, SendICPTsRequest request);

  @JS("showAddressAndPubKeyOnDevice")
  external Promise<void> showAddressAndPubKeyOnDevice();

  @JS("createNeuron")
  external Promise<void> createNeuron(dynamic amount);
}
