import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:dfinity_wallet/ui/_components/overlay_base_widget.dart';
import 'package:dfinity_wallet/ui/transaction/create_transaction_overlay.dart';
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
              Overlay.of(context)!.show(context, NewTransactionOverlay(
                rootTitle: 'Manage ICP',
                rootWidget: SelectAccountTransactionTypeWidget(source: widget.primaryAccount,),
              ));
            },
          ),
          SmallFormDivider(),
          TextButton(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Text(
                "Create Sub-Account",
                style: context.textTheme.bodyText2?.copyWith(fontSize: 18),
              ),
            ),
            onPressed: () {
              Overlay.of(context)!.show(context, TextFieldDialogWidget(
                  title: "New Sub-Account",
                  buttonTitle: "Create",
                  fieldName: "Account Name",
                  onComplete: (name) {
                    context.performLoading(() => context.icApi.createSubAccount(name: name));
                  }), borderRadius: 20);
            },
          ),
        ],
      ),
    );
  }

}
