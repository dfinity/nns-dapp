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

  @JS("createAuthenticationIdentity")
  external Promise<dynamic> loginWithIdentityProvider(String returnUrl);

  @JS("createDelegationIdentity")
  external dynamic createDelegationIdentity(String accessToken);

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

  String get host => "http://" + window.location.host;

  @override
  void authenticate() async {
    walletApi.loginWithIdentityProvider(host);
  }

  Future<void> buildServices(BuildContext context) async {
    final token = context.boxes.authToken.webAuthToken;
    if (token != null) {
      final identity = walletApi.createDelegationIdentity(token.data);

      final gatewayHost = host;
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
