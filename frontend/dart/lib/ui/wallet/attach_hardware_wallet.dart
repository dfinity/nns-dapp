import 'package:nns_dapp/ic_api/web/stringify.dart';

import '../../nns_dapp.dart';
import 'hardware_wallet_connection_widget.dart';
import 'package:universal_html/js.dart' as js;

class AttachHardwareWalletWidget extends StatefulWidget {
  final String name;

  const AttachHardwareWalletWidget({Key? key, required this.name})
      : super(key: key);

  @override
  _AttachHardwareWalletWidgetState createState() =>
      _AttachHardwareWalletWidgetState();
}

class _AttachHardwareWalletWidgetState
    extends State<AttachHardwareWalletWidget> {
  WalletConnectionState connectionState = WalletConnectionState.NOT_CONNECTED;
  dynamic ledgerIdentity;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Expanded(
            child: HardwareConnectionWidget(
                connectionState: connectionState,
                ledgerIdentity: ledgerIdentity,
                onConnectPressed: () async {
                  setState(() {
                    connectionState = WalletConnectionState.CONNECTING;
                  });
                  final res = await context.icApi.connectToHardwareWallet();

                  res.when(ok: (ledgerIdentity) {
                    setState(() {
                      this.ledgerIdentity = ledgerIdentity;
                      connectionState = WalletConnectionState.CONNECTED;
                    });
                  }, err: (err) {
                    setState(() {
                      this.ledgerIdentity = null;
                      connectionState = WalletConnectionState.NOT_CONNECTED;
                      // Display the error to the user.
                      js.context.callMethod("alert", ["$err"]);
                    });
                  });
                }),
          ),
          SizedBox(
              height: 70,
              width: double.infinity,
              child: ElevatedButton(
                child: Text("Attach Wallet"),
                onPressed: (() async {
                  context.callUpdate(() async {
                    await context.icApi.registerHardwareWallet(
                        name: widget.name, ledgerIdentity: ledgerIdentity);
                    await context.icApi.refreshAccounts(waitForFullSync: true);
                    final accountIdentifier =
                        getAccountIdentifier(ledgerIdentity);
                    final account = context.boxes.accounts.hardwareWallets
                        .firstWhere((element) =>
                            element.accountIdentifier == accountIdentifier);

                    context.nav.push(accountPageDef.createPageConfig(account));
                  });
                }).takeIf(
                    (e) => connectionState == WalletConnectionState.CONNECTED),
              ))
        ],
      ),
    );
  }
}
