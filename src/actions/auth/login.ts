"use server";

import { signIn } from "@/auth.config";
import { AuthError } from "next-auth";

type AuthState = {
  error?: string;
  success?: boolean;
  callbackUrl?: string;
};

export async function authenticate(
  prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  try {
    // await sleep(2);
    const data = Object.fromEntries(formData);
    const callbackUrl = (data.callbackUrl as string) || "/";
    console.log("⭕: ", data);
    await signIn("credentials", {
      ...Object.fromEntries(formData),
      redirect: false,
    });
    return { success: true, callbackUrl };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error;
  }
}

export const login = async (email: string, password: string) => {
  try {
    await signIn("credentials", { email, password });
    return {
      ok: true,
    };
  } catch (error) {
    console.log(error);
    return {
      ok: false,
      message: "No se pudo iniciar sesion",
    };
  }
};
