import { pipe, Schema } from "effect";
import { Email } from "./email.ts";
import { Password } from "./password.ts";

export const RegisterBasicInfo = Schema.Struct({
  name: Schema.String.pipe(
    Schema.minLength(1, {
      message: () => "Name is required",
    }),
    Schema.maxLength(100, { message: () => "Name is too long" }),
    Schema.annotations({
      title: "Full Name",
      description: "Your full name as you would like it to appear",
    }),
  ),
  graduationYear: Schema.Number.pipe(
    Schema.int(),
    Schema.greaterThanOrEqualTo(2020, {
      message: () => "Graduation year must be 2020 or later",
    }),
    Schema.lessThanOrEqualTo(2100, {
      message: () => "Graduation year must be 2100 or earlier",
    }),
    Schema.annotations({
      title: "Graduation Year",
      description: "Your expected graduation year",
    }),
  ),
});

export const registerBasicInfoSchema = RegisterBasicInfo.pipe(
  Schema.standardSchemaV1,
);

export type RegisterBasicInfo = typeof RegisterBasicInfo.Type;

export const RegisterSchoolEmail = Schema.Struct({
  schoolEmail: Email.annotations({
    title: "School Email",
    description: "Your school email address",
  }),
});

export const registerSchoolEmailSchema = RegisterSchoolEmail.pipe(
  Schema.standardSchemaV1,
);

export type RegisterSchoolEmail = typeof RegisterSchoolEmail.Type;

export const RegisterPersonalEmail = Schema.Struct({
  personalEmail: Email.annotations({
    title: "Personal Email",
    description: "Your personal email address",
  }),
});

export const registerPersonalEmailSchema = RegisterPersonalEmail.pipe(
  Schema.standardSchemaV1,
);

export type RegisterPersonalEmail = typeof RegisterPersonalEmail.Type;

export const RegisterPassword = Schema.Struct({
  _password: Password.annotations({
    title: "Password",
    description: "Account password",
  }),

  _confirmPassword: Password.annotations({
    title: "Confirm Password",
    description: "Re-enter your password",
  }),
}).pipe(
  Schema.filter(
    (data) =>
      data._password === data._confirmPassword || "Passwords do not match",
  ),
);

export const registerPasswordSchema = RegisterPassword.pipe(
  Schema.standardSchemaV1,
);

export type RegisterPassword = typeof RegisterPassword.Type;

const FullRegistration = Schema.asSchema(
  pipe(
    RegisterBasicInfo,
    Schema.extend(RegisterSchoolEmail),
    Schema.extend(RegisterPersonalEmail),
    Schema.extend(RegisterPassword),
  ),
);

export const fullRegistrationSchema = FullRegistration.pipe(
  Schema.standardSchemaV1,
);
