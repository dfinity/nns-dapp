import '../../nns_dapp.dart';

class ConfirmVoteDialog extends StatelessWidget {
  final String svg;
  final Color svgColor;
  final String title;
  final String description;
  final Function onConfirm;

  const ConfirmVoteDialog(
      {Key? key,
      required this.svg,
      required this.svgColor,
      required this.title,
      required this.description,
      required this.onConfirm})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ConstrainedBox(
      constraints: BoxConstraints(maxWidth: 500),
      child: Container(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: SizedBox(
                    width: 50,
                    height: 50,
                    child: SvgPicture.asset(
                      svg,
                      color: svgColor,
                    ),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: Text(title, style: context.textTheme.headline3),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Text(
                    description,
                    style: context.textTheme.bodyText1,
                    textAlign: TextAlign.center,
                  ),
                ),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                          style: ButtonStyle(
                              backgroundColor:
                                  MaterialStateProperty.all(AppColors.gray800)),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Text("Cancel"),
                          ),
                          onPressed: () {
                            OverlayBaseWidget.of(context)?.dismiss();
                          }),
                    ),
                    SizedBox(
                      width: 20,
                    ),
                    Expanded(
                      child: ElevatedButton(
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Text("Yes, I'm sure"),
                          ),
                          onPressed: () {
                            OverlayBaseWidget.of(context)?.dismiss();
                            onConfirm();
                          }),
                    )
                  ],
                )
              ]),
        ),
      ),
    );
  }
}
