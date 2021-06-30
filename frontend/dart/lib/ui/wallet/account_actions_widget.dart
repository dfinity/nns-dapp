import 'package:dfinity_wallet/ui/_components/overlay_base_widget.dart';
import 'package:dfinity_wallet/ui/transaction/wizard_overlay.dart';
import 'package:dfinity_wallet/ui/transaction/select_transaction_type_widget.dart';
import 'package:flutter/material.dart';
import 'package:dfinity_wallet/dfinity.dart';

class AccountActionsWidget extends StatefulWidget {

  final Account primaryAccount;

  const AccountActionsWidget({
    Key? key, required this.primaryAccount,
  }) : super(key: key);

  @override
  _AccountActionsWidgetState createState() => _AccountActionsWidgetState();
}

class _AccountActionsWidgetState extends State<AccountActionsWidget> {


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
                    "Manage ICP",
                    textAlign: TextAlign.center,
                    style: context.textTheme.button?.copyWith(fontSize: 24),
                  ),
                ),
              ),
            ),
            onPressed: () {
              OverlayBaseWidget.show(context, WizardOverlay(
                rootTitle: 'Manage ICP',
                rootWidget: SelectAccountTransactionTypeWidget(source: widget.primaryAccount,),
              ));
            },
          ),
        ],
      ),
    );
  }

}
