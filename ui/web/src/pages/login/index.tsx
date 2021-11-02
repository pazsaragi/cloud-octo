import React, { useState } from "react";
import { useRouter } from "next/router";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { loginSchema } from "../../../schemas";
import { useAuthStore } from "../../features/auth/auth-store";
import { LoginUserInput } from "../../features/auth/inputs";

interface Props {}

function Login(props: Props) {
  const {} = props;

  const router = useRouter();
  const store = useAuthStore();
  const [_, setErr] = useState("");

  const { register, handleSubmit, formState } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data: LoginUserInput) => {
    const err = await store.login(data);
    if (err) {
      setErr(err.message);
      return;
    }
    router.push("/profile");
  };

  return (
    <div>
      <>
        <h1>Login</h1>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input id="email" placeholder="email" {...register("email")} />
            <input
              id="password"
              placeholder="password"
              type="password"
              {...register("password")}
            />
            <button type="submit">Submit</button>
          </form>
          <div>
            <div>
              <Link href="/forgot-password">Forgot Password</Link>
            </div>
            <div>
              <Link href="/register">Register Now!</Link>
            </div>
          </div>
        </div>
      </>
    </div>
  );
}

export default Login;
