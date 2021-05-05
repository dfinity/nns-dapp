
import '../../dfinity.dart';

class WizardPathButton extends StatelessWidget {
  final String title;
  final String subtitle;
  final Function() onPressed;

  const WizardPathButton(
      {Key? key,
        required this.title,
        required this.subtitle,
        required this.onPressed})
      : super(key: key);

  @override
  Widget build(BuildContext context) {
    return TextButton(
      style: ButtonStyle(
          shape: MaterialStateProperty.all(
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(24))),
          overlayColor: MaterialStateProperty.resolveWith((states) {
            return AppColors.blue600.withOpacity(0.5);
          })),
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: SizedBox(
          width: double.infinity,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: context.textTheme.headline3,
              ),
              SizedBox(
                height: 10,
              ),
              Text(
                subtitle,
                style: context.textTheme.subtitle2
                    ?.copyWith(color: AppColors.gray200),
              ),
            ],
          ),
        ),
      ),
      onPressed: onPressed,
    );
    ;
  }
}
