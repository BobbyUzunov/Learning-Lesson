export const MIN_SIGNUP_PASSWORD_LENGTH = 8;

export type PasswordRequirementId = "length" | "lowercase" | "uppercase" | "digit" | "special";

export type PasswordRequirementStatus = {
  id: PasswordRequirementId;
  met: boolean;
};

export function getPasswordRequirementStatus(password: string): PasswordRequirementStatus[] {
  return [
    { id: "length", met: password.length >= MIN_SIGNUP_PASSWORD_LENGTH },
    { id: "lowercase", met: /[a-z]/.test(password) },
    { id: "uppercase", met: /[A-Z]/.test(password) },
    { id: "digit", met: /\d/.test(password) },
    { id: "special", met: /[^A-Za-z0-9]/.test(password) }
  ];
}

export function isSignupPasswordValid(password: string) {
  return getPasswordRequirementStatus(password).every((item) => item.met);
}
