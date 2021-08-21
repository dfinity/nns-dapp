import 'package:dfinity_wallet/ic_api/ic_api_widgets.dart';
import 'package:dfinity_wallet/ui/_components/custom_auto_size.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';

import '../../dfinity.dart';

class AuthWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.lightBackground,
      child: Stack(
        children: [
          Container(
            padding: EdgeInsets.all(MediaQuery.of(context).size.width * 0.1),
            child: Center(
              child: ConstrainedBox(
                constraints: BoxConstraints(maxWidth: 500),
                child: Column(
                  children: [
                    AutoSizeText(
                      'The Internet Computer',
                      style: context.textTheme.headline1,
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 20),
                    AutoSizeText(
                      'Network Nervous System',
                      style: context.textTheme.headline2,
                      textAlign: TextAlign.center,
                    ),
                    Expanded(child: Container()),
                    ElevatedButton(
                        child: Padding(
                          padding: const EdgeInsets.all(32.0),
                          child: Text(
                            "Login",
                            style: context.textTheme.bodyText2
                                ?.copyWith(fontSize: 32),
                          ),
                        ),
                        style: ButtonStyle(
                            backgroundColor:
                                MaterialStateProperty.all(AppColors.gray1000)),
                        onPressed: () {
                          context.icApi.authenticate(() {
                            context.nav.push(accountsTabPage);
                          });
                        }),
                    SizedBox(height: 20),
                    AutoSizeText(
                      'Beta',
                      style:
                          context.textTheme.headline4?.copyWith(fontSize: 18),
                      textAlign: TextAlign.center,
                    ),
                    SmallFormDivider(),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
