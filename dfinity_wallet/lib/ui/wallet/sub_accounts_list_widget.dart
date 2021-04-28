
import 'package:dfinity_wallet/ui/_components/form_utils.dart';

import '../../dfinity.dart';
import 'account_row.dart';

class SubAccountsListWidget extends StatelessWidget {
  final List<Account> subAccounts;
  final String buttonTitle;
  final Function buttonAction;

  const SubAccountsListWidget({Key? key, required this.subAccounts, required this.buttonTitle, required this.buttonAction})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          height: 20,
        ),
        ...subAccounts.mapToList((e) => AccountRow(
          account: e,
          onTap: () {
            context.nav.push(AccountPageDef.createPageConfig(e));
          },
        )),
        SmallFormDivider(),
        TextButton(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Text(
              buttonTitle,
              style: context.textTheme.bodyText2?.copyWith(fontSize: 18),
            ),
          ),
          onPressed: () {
            buttonAction();
          },
        ),
      ],
    );
  }
}