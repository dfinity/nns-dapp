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
    final identityPromise = walletApi.createAuthenticationIdentity();
    final identity = await promiseToFuture(identityPromise);
    print("test ${identity}");
    print("test ${identity.getPublicKey()}");
    print("test ${identity.getPublicKey().toDer()}");

    final governanceService = walletApi.buildGovernanceService("http://localhost:8080/", identity);
    final pendingProposalsPromise = governanceService.get_pending_proposals();
    final pendingProposals = await promiseToFuture(pendingProposalsPromise);
    print("pending proposals: ${pendingProposals}");

    final ledgerService = walletApi.buildLedgerService("http://localhost:8080/", identity);
    final getBlockPromise = ledgerService.block(1);
    final block = await promiseToFuture(getBlockPromise);
    print("block 1: ${block}");


    // final principal = Principal.anonymous();
    // bool isAnon = principal.isAnonymous();
    // print("is Anon ${isAnon}");
    return Uuid().v4();
  }
}

