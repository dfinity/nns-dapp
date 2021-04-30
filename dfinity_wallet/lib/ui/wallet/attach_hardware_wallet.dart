import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/valid_fields_submit_button.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';
import 'package:dfinity_wallet/ui/wallet/account_detail_widget.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';

import '../../dfinity.dart';

class HardwareWalletNameWidget extends StatelessWidget {

  ValidatedTextField nameField = ValidatedTextField("Hardware Wallet Name",
      validations: [StringFieldValidation.minimumLength(2)]);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(32.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Center(
            child: FractionallySizedBox(
              widthFactor: 0.7,
              child: Card(
                child: Padding(
                  padding: const EdgeInsets.all(6.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text("Name", style: context.textTheme.headline3),
                      DebouncedValidatedFormField(nameField),
                    ],
                  ),
                ),
              ),
            ),
          ),
          SizedBox(
              height: 70,
              width: double.infinity,
              child: ValidFieldsSubmitButton(
                child: Text("Connect to Wallet"),
                onPressed: () async {
                  NewTransactionOverlay.of(context).pushPage("Connect to Wallet", AttachHardwareWalletWidget(name: nameField.name));
                },
                fields: [nameField],
              ))
        ],
      ),
    );
  }
}


class AttachHardwareWalletWidget extends StatefulWidget {
  final String name;

  const AttachHardwareWalletWidget({Key? key, required this.name}) : super(key: key);

  @override
  _AttachHardwareWalletWidgetState createState() =>
      _AttachHardwareWalletWidgetState();
}

class _AttachHardwareWalletWidgetState
    extends State<AttachHardwareWalletWidget> {


  ConnectionState connectionState = ConnectionState.NOT_CONNECTED;
  String? hardwareWalletId;

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
                hardwareWalletId: hardwareWalletId,
                onConnectPressed: () async {
                  setState(() {
                    connectionState = ConnectionState.CONNECTING;
                  });
                  final walletApi = await context.icApi.createHardwareWalletApi();
                  setState(() {
                    hardwareWalletId =
                        context.boxes.accounts.primary.identifier.reversed;
                    connectionState = ConnectionState.CONNECTED;
                  });
                }),
          ),
          SizedBox(
              height: 70,
              width: double.infinity,
              child: ElevatedButton(
                child: Text("Attach Wallet"),
                onPressed: (() async {
                  await context.performLoading(() => 2.seconds.delay);
                  final account = Account.create(
                      name: widget.name,
                      accountIdentifier: hardwareWalletId!,
                      primary: false,
                      subAccountId: null,
                      balance: "0",
                      transactions: [],
                      neurons: null,
                      hardwareWallet: true);
                  context.boxes.accounts.put(hardwareWalletId, account);
                  context.nav.push(AccountPageDef.createPageConfig(account));
                }).takeIf((e) => connectionState == ConnectionState.CONNECTED),
              ))
        ],
      ),
    );
  }
}

enum ConnectionState { NOT_CONNECTED, CONNECTING, CONNECTED }

class HardwareConnectionWidget extends StatelessWidget {
  final ConnectionState connectionState;
  final Function() onConnectPressed;
  final String? hardwareWalletId;

  const HardwareConnectionWidget(
      {Key? key,
      required this.connectionState,
      required this.hardwareWalletId,
      required this.onConnectPressed})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    switch (connectionState) {
      case ConnectionState.NOT_CONNECTED:
        return Center(
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: ElevatedButton(
                style: ButtonStyle(
                    backgroundColor:
                        MaterialStateProperty.all(AppColors.gray600)),
                child: Padding(
                  padding: const EdgeInsets.all(32.0),
                  child: Text(
                    "Connect to Wallet",
                    style: TextStyle(
                        fontSize: 30,
                        fontFamily: Fonts.circularBook,
                        color: AppColors.gray50,
                        fontWeight: FontWeight.w100),
                  ),
                ),
                onPressed: onConnectPressed),
          ),
        );
      case ConnectionState.CONNECTING:
        return Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text("Connecting", style: context.textTheme.subtitle1),
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: SpinKitWanderingCubes(
                  color: Colors.white,
                  size: 100.0,
                  duration: 1.seconds,
                ),
              ),
            ],
          ),
        );
      case ConnectionState.CONNECTED:
        return Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text("Connected to Hardware Wallet",
                    style: context.textTheme.subtitle1),
              ),
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text(
                  hardwareWalletId!,
                  style: context.textTheme.subtitle2,
                ),
              ),
            ],
          ),
        );
    }
  }
}
