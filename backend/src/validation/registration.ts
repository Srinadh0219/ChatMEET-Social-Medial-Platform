import validator from 'validator';
import isEmpty from 'is-empty';

interface RegisterData {
  name?: string;
  email?: string;
  password?: string;
  password2?: string;
}

export const validateRegisterInput = (data: RegisterData) => {
  const errors: { error?: string } = {};

  const name = !isEmpty(data.name) ? data.name! : '';
  const email = !isEmpty(data.email) ? data.email! : '';
  const password = !isEmpty(data.password) ? data.password! : '';
  const password2 = !isEmpty(data.password2) ? data.password2! : '';

  // Name
  if (validator.isEmpty(name)) {
    errors.error = 'Name field is required';
    return { errors, isValid: false };
  }

  // Email
  if (validator.isEmpty(email)) {
    errors.error = 'Email field is required';
    return { errors, isValid: false };
  }
  if (!validator.isEmail(email)) {
    errors.error = 'Email is invalid';
    return { errors, isValid: false };
  }

  // Password
  if (validator.isEmpty(password)) {
    errors.error = 'Password field is required';
    return { errors, isValid: false };
  }
  if (!validator.isLength(password, { min: 6, max: 30 })) {
    errors.error = 'Password must be at least 6 characters';
    return { errors, isValid: false };
  }

  // Confirm password
  if (validator.isEmpty(password2)) {
    errors.error = 'Confirm password field is required';
    return { errors, isValid: false };
  }
  if (!validator.equals(password, password2)) {
    errors.error = 'Passwords must match';
    return { errors, isValid: false };
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

export default validateRegisterInput;
