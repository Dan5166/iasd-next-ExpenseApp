"use client";

import { login, registerUser } from "@/actions";
import clsx from "clsx";
import Link from "next/link";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

type FormInputs = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();

  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setErrorMessage("");
    const { name, email, password } = data;

    // Server action
    const res = await registerUser(name, email, password);
    if (!res.ok) {
      setErrorMessage(res.message);
      return;
    }

    console.log({ res });

    await login(email.toLowerCase(), password);

    window.location.replace("/");
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <label htmlFor="name">Nombre Completo</label>
        <input
          className={clsx("px-5 py-2 border bg-gray-200 rounded mb-5", {
            "border-red-500": !!errors.name,
          })}
          type="text"
          autoFocus
          {...register("name", { required: true })}
        />
        <label htmlFor="email">Correo electronico</label>
        <input
          className={clsx("px-5 py-2 border bg-gray-200 rounded mb-5", {
            "border-red-500": !!errors.email,
          })}
          type="email"
          {...register("email", {
            required: true,
            pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/,
          })}
        />

        <label htmlFor="password">Contraseña</label>
        <input
          className={clsx("px-5 py-2 border bg-gray-200 rounded mb-5", {
            "border-red-500": !!errors.password,
          })}
          type="password"
          {...register("password", { required: true, minLength: 6 })}
        />

        <span className="text-red-500">{errorMessage}</span>

        <button className="btn-primary">Crear cuenta</button>

        {/* divisor l ine */}
        <div className="flex items-center my-5">
          <div className="flex-1 border-t border-gray-500"></div>
          <div className="px-2 text-gray-800">O</div>
          <div className="flex-1 border-t border-gray-500"></div>
        </div>

        <Link href="/auth/login" className="btn-secondary text-center">
          Ingresar
        </Link>
      </form>
    </div>
  );
}
