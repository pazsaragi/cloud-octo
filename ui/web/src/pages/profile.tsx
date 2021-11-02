import { GetServerSideProps } from "next";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAuthStore } from "../features/auth/auth-store";
import { useBusinessStore } from "../features/business/business-store";
import { CreateBusinessInput } from "../features/business/inputs";

interface Props {}

function Profile(props: Props) {
  const {} = props;
  const store = useBusinessStore();
  const authStore = useAuthStore();
  const [business, setBusiness] = useState();

  const { register, handleSubmit, formState } = useForm({});

  useEffect(() => {
    const getBusiness = async () => {
      if (!authStore.token) {
        return;
      }
      setBusiness(await store.getBusiness(authStore.token));
    };
    getBusiness();
  }, []);

  const onSubmit = async (data: CreateBusinessInput) => {
    if (!authStore.token) {
      return;
    }
    await store.createBusiness(data, authStore.token);
  };

  return (
    <div>
      {JSON.stringify(business)}
      <form onSubmit={handleSubmit(onSubmit)}>
        <input placeholder="pk" {...register("pk")} />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default Profile;
