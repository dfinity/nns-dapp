import 'package:nns_dapp/ic_api/web/stringify.dart';
import 'package:nns_dapp/ui/_components/form_utils.dart';
import 'package:nns_dapp/ui/_components/responsive.dart';

import '../../nns_dapp.dart';
import 'package:flutter_spinkit/flutter_spinkit.dart';

enum WalletConnectionState {
  NOT_CONNECTED,
  CONNECTING,
  CONNECTED,
  INCORRECT_DEVICE
}

class HardwareConnectionWidget extends StatelessWidget {
  final WalletConnectionState connectionState;
  final Function() onConnectPressed;
  final dynamic ledgerIdentity;

  const HardwareConnectionWidget(
      {Key? key,
      required this.connectionState,
      required this.ledgerIdentity,
      required this.onConnectPressed})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    switch (connectionState) {
      case WalletConnectionState.NOT_CONNECTED:
        return Center(
          child: Padding(
            padding: const EdgeInsets.all(8.0),
            child: ElevatedButton(
                style: ButtonStyle(
                    backgroundColor:
                        MaterialStateProperty.all(AppColors.gray600)),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    "Connect to Wallet",
                    style: TextStyle(
                        fontSize: Responsive.isMobile(context) ? 14 : 30,
                        fontFamily: Fonts.circularBook,
                        color: AppColors.gray50,
                        fontWeight: FontWeight.w100),
                  ),
                ),
                onPressed: onConnectPressed),
          ),
        );
      case WalletConnectionState.CONNECTING:
        return Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text("Connecting", style: context.textTheme.subtitle1),
              ),
              Padding(
                padding: const EdgeInsets.all(16.0),
                child: SpinKitWanderingCubes(
                  color: Colors.white,
                  size: 100.0,
                  duration: 1.seconds,
                ),
              ),
              ElevatedButton(
                  style: ButtonStyle(
                      backgroundColor:
                          MaterialStateProperty.all(AppColors.gray600)),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text(
                      "Retry",
                      style: TextStyle(
                          fontSize: 20,
                          fontFamily: Fonts.circularBook,
                          color: AppColors.gray50,
                          fontWeight: FontWeight.w100),
                    ),
                  ),
                  onPressed: onConnectPressed)
            ],
          ),
        );
      case WalletConnectionState.CONNECTED:
        return Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text("Connected to Hardware Wallet",
                    style: context.textTheme.subtitle1),
              ),
              if (ledgerIdentity != null)
                IntrinsicWidth(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        "Principal",
                        style: context.textTheme.bodyText1
                            ?.copyWith(fontSize: 14, color: AppColors.gray50),
                      ),
                      Text(
                        ledgerIdentity.getPrincipal().toString(),
                        style: context.textTheme.subtitle2,
                      ),
                      SmallFormDivider(),
                      Text(
                        "Account Identifier",
                        style: context.textTheme.bodyText1
                            ?.copyWith(fontSize: 14, color: AppColors.gray50),
                      ),
                      Text(
                        getAccountIdentifier(ledgerIdentity)!,
                        style: context.textTheme.subtitle2,
                      ),
                    ],
                  ),
                )
            ],
          ),
        );
      case WalletConnectionState.INCORRECT_DEVICE:
        return Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.all(8.0),
                child: Text("Incorrect Wallet Connected",
                    style: context.textTheme.subtitle1),
              ),
              Text(
                "This hardware wallet is for another account, not the one you have selected in the user interface",
                style: context.textTheme.subtitle2,
              ),
              SmallFormDivider(),
              if (ledgerIdentity != null)
                IntrinsicWidth(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        "Key of attached wallet",
                        style: context.textTheme.bodyText1
                            ?.copyWith(fontSize: 14, color: AppColors.gray50),
                      ),
                      Text(
                        getPublicKey(ledgerIdentity)!,
                        style: context.textTheme.subtitle2,
                      ),
                      SmallFormDivider(),
                    ],
                  ),
                )
            ],
          ),
        );
    }
  }
}
