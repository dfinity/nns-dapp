import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/overlay_base_widget.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';
import 'package:flutter/material.dart';
import 'package:dfinity_wallet/dfinity.dart';

class AccountActionsWidget extends StatefulWidget {

  final Wallet primaryWallet;

  const AccountActionsWidget({
    Key? key, required this.primaryWallet,
  }) : super(key: key);

  @override
  _AccountActionsWidgetState createState() => _AccountActionsWidgetState();
}

class _AccountActionsWidgetState extends State<AccountActionsWidget> {

  OverlayEntry? _overlayEntry;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          ElevatedButton(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: SizedBox(
                width: 400,
                child: Center(
                  child: Text(
                    "Send ICPT",
                    textAlign: TextAlign.center,
                    style: context.textTheme.button?.copyWith(fontSize: 24),
                  ),
                ),
              ),
            ),
            onPressed: () {
              _overlayEntry = _createOverlayEntry();
              Overlay.of(context)?.insert(_overlayEntry!);
            },
          ),
          SmallFormDivider(),
          TextButton(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                "Create Sub Account",
                style: context.textTheme.bodyText2?.copyWith(fontSize: 18),
              ),
            ),
            onPressed: () {
              showDialog(
                  context: context,
                  builder: (overlayContext) => Center(
                      child: TextFieldDialogWidget(
                          title: "New Sub Account",
                          buttonTitle: "Create",
                          fieldName: "Account Name",
                          onComplete: (name) {
                            context.performLoading(() => context.icApi.createSubAccount(name));
                          })));
            },
          ),
        ],
      ),
    );
  }


  OverlayEntry _createOverlayEntry() {
    final parentContext = this.context;
    return OverlayEntry(builder: (context) {
      return OverlayBaseWidget(
          parentContext: parentContext,
          overlayEntry: _overlayEntry,
          child: NewTransactionOverlay(
            source: widget.primaryWallet,
          ));
    });
  }
}
