
import 'package:dfinity_wallet/ui/_components/form_utils.dart';

import '../../dfinity.dart';
import 'account_row.dart';

class SubAccountsListWidget extends StatelessWidget {
  final List<Account> subAccounts;

  const SubAccountsListWidget({Key? key, required this.subAccounts})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [

      ],
    );
  }
}