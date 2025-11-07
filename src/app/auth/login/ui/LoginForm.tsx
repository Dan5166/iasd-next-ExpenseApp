"use client";

import { authenticate } from "@/actions";
import clsx from "clsx";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useActionState, useEffect } from "react";
import { IoWarning } from "react-icons/io5";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  console.log("CALLBACK URL EN LOGINFORM:   ", callbackUrl);
  const [state, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );
  useEffect(() => {
    if (state?.success && state?.callbackUrl) {
      window.location.replace(callbackUrl ? callbackUrl : "/");
    }
  }, [state, callbackUrl]);
  return (
    <form action={formAction} className="flex flex-col">
      <label htmlFor="email">Correo electrónico</label>
      <input
        className="px-5 py-2 border bg-gray-200 rounded mb-5"
        type="email"
        name="email"
        required
        disabled={isPending}
      />

      <label htmlFor="password">Contraseña</label>
      <input
        className="px-5 py-2 border bg-gray-200 rounded mb-5"
        type="password"
        name="password"
        required
        minLength={6}
        disabled={isPending}
      />

      <input type="hidden" name="redirectTo" value={callbackUrl} />
      <button
        className={clsx({
          "btn-primary": !isPending,
          "btn-disabled": isPending,
        })}
        type="submit"
        disabled={isPending}
      >
        {isPending ? "Ingresando..." : "Ingresar"}
      </button>
      <div
        className="flex h-8 items-end space-x-1"
        aria-live="polite"
        aria-atomic="true"
      >
        {state && (
          <>
            <IoWarning className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-500">{state.error}</p>
          </>
        )}
      </div>

      {/* divisor l ine */}
      <div className="flex items-center my-5">
        <div className="flex-1 border-t border-gray-500"></div>
        <div className="px-2 text-gray-800">O</div>
        <div className="flex-1 border-t border-gray-500"></div>
      </div>

      <Link href="/auth/request-account" className="btn-secondary text-center">
        Solicita tu cuenta
      </Link>
    </form>
  );
}
