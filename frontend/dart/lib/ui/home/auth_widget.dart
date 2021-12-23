import 'package:nns_dapp/ui/_components/custom_auto_size.dart';

import '../../nns_dapp.dart';

class AuthWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      constraints: BoxConstraints.expand(),
      decoration: BoxDecoration(
        image: DecorationImage(
            image: AssetImage('assets/nns_background.jpeg'), fit: BoxFit.cover),
      ),
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
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'NETWORK',
                          style: context.textTheme.headline2!.copyWith(
                            color: Color(0x2ca8df),
                          ),
                        ),
                        Text(' . '),
                        Text(
                          'NERVOUS',
                          style: context.textTheme.headline2!.copyWith(
                            color: Color(0xd81c6f),
                          ),
                        ),
                        Text(' . '),
                        Text(
                          'SYSTEM',
                          style: context.textTheme.headline2!.copyWith(
                            color: Color(0x859d44),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 20),
                    SvgPicture.asset("assets/ic_colour_logo.svg"),
                    Expanded(child: Container()),
                    Row(
                      children: [
                        Text(
                          'ICP',
                          style: TextStyle(
                            color: Color(0x859d44),
                          ),
                        ),
                        Text(
                          'and',
                        ),
                        Text(
                          'governance',
                          style: TextStyle(
                            color: Color(0x2ca8df),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(height: 10),
                    ElevatedButton(
                        child: Padding(
                          padding: const EdgeInsets.all(20.0),
                          child: Text(
                            "LOGIN",
                            style: context.textTheme.headline3,
                          ),
                        ),
                        style: ButtonStyle(
                            backgroundColor:
                                MaterialStateProperty.all(AppColors.blue800)),
                        onPressed: () {
                          context.icApi.authenticate(() {
                            context.nav.push(accountsTabPage);
                          });
                        }),
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
