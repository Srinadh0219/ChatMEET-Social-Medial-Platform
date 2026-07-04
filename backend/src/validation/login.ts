import validator from 'validator';
import isEmpty from 'is-empty';

interface LoginData {
  name?: string;
  password?: string;
}

export const validateLoginInput = (data: LoginData) => {
  let errors: { name?: string; password?: string } = {};

  const name = !isEmpty(data.name) ? data.name! : "";
  const password = !isEmpty(data.password) ? data.password! : "";

  // Name checks
  if (validator.isEmpty(name)) {
    errors.name = "Name field is required";
  }

  // Password checks
  if (validator.isEmpty(password)) {
    errors.password = "Password field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

export default validateLoginInput;
