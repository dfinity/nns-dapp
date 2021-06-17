import 'package:dfinity_wallet/ui/_components/responsive.dart';

import '../../dfinity.dart';

class ConfirmDialog extends StatelessWidget {
  final String title;
  final String description;
  final Function onConfirm;

  const ConfirmDialog(
      {Key? key,
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
                  child: SelectableText(
                    title,
                    style: Responsive.isMobile(context)
                        ? context.textTheme.headline6
                        : context.textTheme.headline3,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: SelectableText(
                    description,
                    style: context.textTheme.subtitle2,
                    textAlign: TextAlign.center,
                  ),
                ),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton(
                          style: ButtonStyle(
                              backgroundColor:
                                  MaterialStateProperty.all(AppColors.gray500)),
                          child: Padding(
                            padding: const EdgeInsets.all(16.0),
                            child: Text(
                              "Cancel",
                              textScaleFactor:
                                  Responsive.isMobile(context) ? 0.48 : 1,
                            ),
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
                            child: Text(
                              "Yes, I'm sure",
                              textScaleFactor:
                                  Responsive.isMobile(context) ? 0.48 : 1,
                            ),
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
