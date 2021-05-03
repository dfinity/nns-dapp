import 'package:dfinity_wallet/ic_api/web/stringify.dart';
import '../../dfinity.dart';
import 'hardware_wallet_connection_widget.dart';

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
                  final ledgerIdentity =
                      await context.icApi.connectToHardwareWallet();
                  final json = stringify(ledgerIdentity);
                  print("identity ${json}");
                  setState(() {
                    this.ledgerIdentity = ledgerIdentity;
                    connectionState = WalletConnectionState.CONNECTED;
                  });
                }),
          ),
          SizedBox(
              height: 70,
              width: double.infinity,
              child: ElevatedButton(
                child: Text("Attach Wallet"),
                onPressed: (() async {


                  context.performLoading(() async {
                    await context.icApi.registerHardwareWallet(name: widget.name, ledgerIdentity: ledgerIdentity);
                    await 0.2.seconds.delay;
                    await context.icApi.refreshAccounts();
                    final accountIdentifier = getAccountIdentifier(ledgerIdentity);
                    final account = context.boxes.accounts.hardwareWallets.firstWhere((element) => element.accountIdentifier == accountIdentifier);

                    context.nav.push(AccountPageDef.createPageConfig(account));
                  });
                }).takeIf((e) => connectionState == WalletConnectionState.CONNECTED),
              ))
        ],
      ),
    );
  }
}

