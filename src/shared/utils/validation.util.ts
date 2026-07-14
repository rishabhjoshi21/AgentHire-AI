import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function RequireOne(
  fields: string[],
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'RequireOne',
      target: object.constructor,
      propertyName,
      constraints: fields,
      options: validationOptions,

      validator: {
        validate(_value: unknown, args: ValidationArguments) {
          const object = args.object as Record<string, unknown>;

          return fields.some((field) => Boolean(object[field]));
        },
      },
    });
  };
}
