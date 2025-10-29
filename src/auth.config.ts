import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import prisma from "./lib/prisma";
import * as bcryptjs from "bcryptjs";

// Rutas que requieren que el usuario esté autenticado (cualquier rol)
const authenticatedRoutes = [
  "/checkout/address",
  "/profile",
  "/orders",
  "/dashboard",
  "/expense/new",
];

// Rutas que requieren que el usuario tenga un rol de "admin" o "super-user"
const adminRoutes = [
  "/admin",
  "/admin/products",
  "/admin/users",
  "/expense",
  "/expenses",
  "/auth/new-account",
];

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/new-account",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const { pathname } = nextUrl;
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role;

      // --- Rutas de autenticación ---
      const isAuthRoute = pathname.startsWith("/auth/");
      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL("/", nextUrl));
      }

      // --- Protección general (requiere login) ---
      const isProtectedRoute = authenticatedRoutes.some((route) =>
        pathname.startsWith(route)
      );
      if (isProtectedRoute && !isLoggedIn) {
        const loginUrl = new URL("/auth/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return Response.redirect(loginUrl);
      }

      // --- Protección admin ---
      // 👇 Aquí hacemos una verificación más estricta para evitar que /expense/new entre
      const isAdminRoute =
        adminRoutes.some(
          (route) => pathname === route || pathname.startsWith(route + "/")
        ) && !pathname.startsWith("/expense/new");

      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        const allowedRoles = ["admin", "super-user"];
        if (userRole && allowedRoles.includes(userRole)) {
          return true;
        }
        return Response.redirect(new URL("/", nextUrl));
      }

      // --- Permitir todo lo demás ---
      return true;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;
        console.log("--- AUTH CONFIG ---");
        console.log({ email, password });
        console.log("------------------");

        // Buscar el correo
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });

        if (!user) return null;

        // Comparar las contraseñas
        if (!bcryptjs.compareSync(password, user.password)) return null;

        // Extraemos toda la info menos el password en rest
        const { password: _, ...rest } = user;

        console.log({ rest });

        // Regresar el usuario sin el password
        return rest;
      },
    }),
  ],
};

// export const { signIn, signOut, auth: middleware } = NextAuth(authConfig);
export const { signIn, signOut, auth, handlers } = NextAuth(authConfig);
