import 'package:dfinity_wallet/ui/_components/form_utils.dart';
import 'package:flutter/services.dart';
import 'package:truncate/truncate.dart';

import '../../dfinity.dart';

class SelectCyclesOriginWidget extends StatelessWidget {
  final Function(Account account, BuildContext context) onSelected;

  const SelectCyclesOriginWidget({Key? key, required this.onSelected})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  "Select ICP Source Account",
                  style: context.textTheme.headline3,
                ),
                SmallFormDivider(),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Container(
                    decoration: ShapeDecoration(
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                            side: BorderSide(
                                width: 2, color: AppColors.gray800))),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: context.boxes.accounts.values
                          .mapToList((e) => _AccountRow(
                              account: e,
                              onPressed: () {
                                onSelected(e, context);
                              })),
                    ),
                  ),
                )
              ]),
        ),
      ),
    );
  }
}

class _AccountRow extends StatelessWidget {
  final Account account;
  final VoidCallback onPressed;
  final bool selected;

  const _AccountRow(
      {Key? key,
      required this.account,
      required this.onPressed,
      this.selected = false})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: onPressed,
      child: Row(
        children: [
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    account.name,
                    style: context.textTheme.headline3,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(
                      left: 16.0, bottom: 16.0, right: 16.0),
                  child: ResponsiveCopyId(
                    accountIdentifier: account.accountIdentifier,
                  ),
                )
              ],
            ),
          ),
          BalanceDisplayWidget(
              amount: account.balance.toBigInt.toICPT,
              amountSize: 30,
              icpLabelSize: 20)
        ],
      ),
    );
  }
}

class ResponsiveCopyId extends StatelessWidget {
  const ResponsiveCopyId({
    Key? key,
    required this.accountIdentifier,
  }) : super(key: key);

  final String accountIdentifier;

  @override
  Widget build(BuildContext context) {
    var displayId = getShortId(MediaQuery.of(context).size.width, accountIdentifier);
    return Row(
      children: [
        Tooltip(
          message: accountIdentifier,
          child: Text(
            displayId,
            style: context.textTheme.bodyText2,
            overflow: TextOverflow.fade,
          ),
        ),
        IconButton(
            icon: Icon(
              Icons.copy,
              color: AppColors.gray100,
            ),
            onPressed: () {
              Clipboard.setData(ClipboardData(text: accountIdentifier));
            })
      ],
    );
  }
}
