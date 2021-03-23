@JS()
library dfinity_agent.js;

import 'dart:js_util';
import 'package:dfinity_wallet/service/platform_signing_service.dart';
import 'package:js/js.dart';
import 'package:uuid/uuid.dart';

@JS("WalletApi")
class WalletApi {
  external factory WalletApi();

  @JS("createAuthenticationIdentity")
  external Promise<dynamic> createAuthenticationIdentity();

  @JS("buildGovernanceService")
  external dynamic buildGovernanceService(String host, dynamic identity);

  @JS("buildLedgerService")
  external dynamic buildLedgerService(String host, dynamic identity);

  @JS("buildLedgerViewService")
  external dynamic buildLedgerViewService(String host, dynamic identity);
}

@JS()
class Promise<T> {
  external Promise(void executor(void resolve(T result), Function reject));
  external Promise then(void onFulfilled(T result), [Function onRejected]);
}

class PlatformSigningService extends AbstractPlatformSigningService {

  @override
  Future<String> createAddressForTag(String tag) async {
    final walletApi = new WalletApi();
    final identity = await promiseToFuture(walletApi.createAuthenticationIdentity());

    const gatewayHost = "http://localhost:8080/";

    final governanceService = walletApi.buildGovernanceService(gatewayHost, identity);
    final pendingProposals = await promiseToFuture(governanceService.get_pending_proposals());
    print("pending proposals: ${pendingProposals}");

    final ledgerService = walletApi.buildLedgerService(gatewayHost, identity);
    final block = await promiseToFuture(ledgerService.block(1));
    print("block 1: ${block}");

    return Uuid().v4();
  }
}

