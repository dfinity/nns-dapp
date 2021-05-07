import 'package:dfinity_wallet/ic_api/ic_api_widgets.dart';
import 'package:dfinity_wallet/ui/_components/form_utils.dart';

import '../../dfinity.dart';
import 'package:auto_size_text/auto_size_text.dart';

class AuthWidget extends StatelessWidget {

  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.lightBackground,
      child: Stack(
        children: [
          Container(
            padding: EdgeInsets.all(MediaQuery
                .of(context)
                .size
                .width * 0.1),
            child: Center(
              child: ConstrainedBox(
                constraints: BoxConstraints(maxWidth: 500),
                child: Column(
                  children: [
                    AutoSizeText(
                      "The Internet Computer", style: context.textTheme.headline1, textAlign: TextAlign.center,),
                    Expanded(child: Container()),
                    ElevatedButton(
                        child: Padding(
                          padding: const EdgeInsets.all(32.0),
                          child: Text("Authenticate", style: context.textTheme.bodyText2?.copyWith(fontSize: 32),),
                        ),
                        style: ButtonStyle(backgroundColor: MaterialStateProperty.all(AppColors.gray1000)),
                        onPressed: () {
                          context.icApi.authenticate((){
                            context.nav.push(AccountsTabPage);
                          });
                        }),
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
