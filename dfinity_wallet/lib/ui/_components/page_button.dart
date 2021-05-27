import 'package:dfinity_wallet/ui/_components/responsive.dart';
import 'package:flutter/material.dart';
import 'package:dfinity_wallet/ui/_components/text_theme.dart';

class PageButton extends StatelessWidget {
  final void Function()? onPress;
  final title;

  PageButton({
    this.title,
    this.onPress,
  });
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(32),
      child: ElevatedButton(
        child: Responsive.isDesktop(context) | Responsive.isTablet(context)
            ? Padding(
                padding: const EdgeInsets.all(16.0),
                child: SizedBox(
                  width: 400,
                  child: Text(
                    title,
                    textAlign: TextAlign.center,
                    style: context.textTheme.button?.copyWith(fontSize: 24),
                  ),
                ),
              )
            : Padding(
                padding: const EdgeInsets.all(16.0),
                child: SizedBox(
                  width: 150,
                  child: Text(
                    title,
                    textAlign: TextAlign.center,
                    style: context.textTheme.button?.copyWith(fontSize: 14),
                  ),
                ),
              ),
        onPressed: onPress,
      ),
    );
  }
}
