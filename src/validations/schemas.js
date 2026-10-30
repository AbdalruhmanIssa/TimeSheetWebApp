import * as yup from "yup";

const optionalText = (max) => yup.string().trim().max(max, `At most ${max} characters`).nullable();

// <input type="number"> gives "" when empty; turn that into undefined so `required` fires
const number = () =>
  yup.number().transform((value, original) => (original === "" ? undefined : value)).typeError("Enter a number");

export const LoginSchema = yup.object({
  emailOrUserName: yup.string().trim().required("Email or username is required"),
  password: yup.string().required("Password is required"),
});

export const TimeEntrySchema = yup.object({
  projectId: yup.string().required("Pick a project"),
  workDate: yup.string().required("Pick the date you worked"),
  hours: number()
    .required("Hours are required")
    .moreThan(0, "Hours must be more than 0")
    .max(12, "At most 12 hours per entry"),
  notes: optionalText(1000),
});

export const ReviewSchema = yup.object({
  comment: yup.string().trim().required("A comment is required").max(1000, "At most 1000 characters"),
});

export const ClientSchema = yup.object({
  name: yup.string().trim().required("Name is required").max(200, "At most 200 characters"),
  contactName: optionalText(200),
  contactEmail: yup.string().trim().email("Enter a valid email").max(256).nullable(),
  phone: optionalText(30),
});

export const ProjectSchema = yup.object({
  name: yup.string().trim().required("Name is required").max(200, "At most 200 characters"),
  description: optionalText(2000),
  clientId: yup.string().required("Pick a client"),
  managerId: yup.string().required("Pick a manager"),
  budgetHours: number().required("Budget is required").moreThan(0, "Budget must be more than 0"),
  startDate: yup.string().required("Start date is required"),
  endDate: yup
    .string()
    .nullable()
    .test("after-start", "End date can't be before the start date", function (value) {
      return !value || !this.parent.startDate || value >= this.parent.startDate;
    }),
  employeeIds: yup.array().of(yup.string()),
});

// same password rules as the API's Identity options
const password = yup
  .string()
  .required("Password is required")
  .min(8, "Password must be at least 8 characters")
  .matches(/[A-Z]/, "Password must contain an uppercase letter")
  .matches(/[a-z]/, "Password must contain a lowercase letter")
  .matches(/[0-9]/, "Password must contain a number");

const userFields = {
  fullName: yup.string().trim().required("Full name is required").min(3, "At least 3 characters").max(200),
  email: yup.string().trim().required("Email is required").email("Enter a valid email").max(256),
  userName: yup.string().trim().required("Username is required").min(3, "At least 3 characters").max(50),
  phoneNumber: optionalText(30),
};

export const CreateUserSchema = yup.object({
  ...userFields,
  password,
  role: yup.string().required("Pick a role"),
});

export const UpdateUserSchema = yup.object(userFields);

export const ResetPasswordSchema = yup.object({
  newPassword: password,
  confirmPassword: yup
    .string()
    .required("Confirm the password")
    .oneOf([yup.ref("newPassword")], "Passwords don't match"),
});
