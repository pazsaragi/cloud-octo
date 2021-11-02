import * as yup from "yup";

export const loginSchema = yup.object().shape({
  email: yup.string().required(),
  password: yup
    .string()
    .min(8, "Password is too short - should be 8 chars minimum.")
    .required(),
});

export const tableSchema = yup.object().shape({
  tableNumber: yup.string().required(),
});

export const createMenuSchema = yup.object().shape({
  name: yup.string().required(),
});

export const createSectionSchema = yup.object().shape({
  SectionName: yup.string().required(),
});

export const registerSchema = yup.object().shape({
  password: yup
    .string()
    .min(8, "Password is too short - should be 8 chars minimum.")
    .required(),
  email: yup.string().required(),
});

export const createTableSchema = yup.object().shape({
  table_num: yup.string().required(),
});

export const createProductSchema = yup.object().shape({
  ProductName: yup.string().required(),
  allergens: yup.array(),
  price: yup.string().required(),
});

export const findRestaurantSchema = yup.object().shape({
  org_name: yup.string().required(),
});
