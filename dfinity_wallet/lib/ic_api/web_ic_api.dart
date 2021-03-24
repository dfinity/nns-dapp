@JS()
library dfinity_agent.js;

import 'dart:js_util';
import 'package:dfinity_wallet/ic_api/platform_ic_api.dart';
import 'package:js/js.dart';
import 'package:uuid/uuid.dart';
import 'dart:html';

import '../dfinity.dart';

@JS("WalletApi")
class WalletApi {
  external factory WalletApi();

  @JS("createKey")
  external String createKey();

  @JS("createAuthenticationIdentity")
  external Promise<dynamic> loginWithIdentityProvider(String key, String returnUrl);

  @JS("createDelegationIdentity")
  external dynamic createDelegationIdentity(String key, String accessToken);

  @JS("createDelegationIdentity")
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

class PlatformICApi extends AbstractPlatformICApi {
  final walletApi = new WalletApi();

  @override
  void authenticate(BuildContext context) async {
    await context.boxes.authToken.clear();

    final key = walletApi.createKey();
    context.boxes.authToken.put(WEB_TOKEN_KEY, AuthToken()..key = key);
    walletApi.loginWithIdentityProvider(key, "http://" + window.location.host + "/home");
  }

  Future<void> buildServices(BuildContext context) async {
    final token = context.boxes.authToken.webAuthToken;
    if (token != null && token.data != null) {
      final identity = walletApi.createDelegationIdentity(token.key, token.data!);

      const gatewayHost = "http://10.12.31.5:8080/";
      final governanceService =
          walletApi.buildGovernanceService(gatewayHost, identity);
      final pendingProposals =
          await promiseToFuture(governanceService.get_pending_proposals());
      print("pending proposals: ${pendingProposals}");

      final ledgerService = walletApi.buildLedgerService(gatewayHost, identity);
      final block = await promiseToFuture(ledgerService.block(1));
      print("block 1: ${block}");
    }
  }


}
