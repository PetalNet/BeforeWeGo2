import { Schema } from "effect";

export const Password = Schema.String.pipe(
  Schema.minLength(6),
  Schema.maxLength(255),
  Schema.annotations({
    title: "Password",
    description: "A password",
  }),
  Schema.brand("Password"),
  Schema.annotations({ title: "Password" }),
);

export type Password = typeof Password.Type;
