import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

@ValidatorConstraint({ name: 'confirm_password', async: false })
export class PasswordMatchValidator implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        const password = args.object['password'];
        return password === value;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Confirm password must match the password';
    }
}
