import { Schema } from "effect";
import { Email } from "./email.ts";
import { Password } from "./password.ts";

export const Login = Schema.Struct({
  email: Email.annotations({
    title: "Email",
    description: "personal email address",
  }),

  _password: Password.annotations({
    title: "Password",
    description: "account password",
  }),
});

export const loginSchema = Login.pipe(Schema.standardSchemaV1);

export type Login = typeof Login.Type;
