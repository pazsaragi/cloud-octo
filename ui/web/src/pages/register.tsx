import React from "react";
import { registerSchema } from "../../schemas";
import { useRouter } from "next/router";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useAuthStore } from "../features/auth/auth-store";
import { RegisterUserInput } from "../features/auth/inputs";

interface Props {}

const Roles = ["admins", "employee"];

function Register(props: Props) {
  const {} = props;
  const router = useRouter();
  const store = useAuthStore();

  const { register, handleSubmit, formState } = useForm({});

  const onSubmit = async ({ email, password, roles }: RegisterUserInput) => {
    const [err, _] = await store.register({ email, password, roles });

    router.push("/login");
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input id="email" placeholder="email" {...register("email")} />
      <input
        id="password"
        placeholder="password"
        type="password"
        {...register("password")}
      />
      <fieldset style={{ float: "left" }}>
        <legend>Roles</legend>
        {Roles.map((r, i) => (
          <label key={r}>
            <input type="checkbox" value={r} {...register("roles")} />
            {r}
          </label>
        ))}
      </fieldset>
      <button type="submit">Submit</button>
    </form>
  );
}

export default Register;
