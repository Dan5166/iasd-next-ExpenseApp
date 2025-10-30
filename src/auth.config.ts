import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import prisma from "./lib/prisma";
import * as bcryptjs from "bcryptjs";
import { loginEmailPassFirebase } from "./lib/firebaseClient";

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

      console.log("USUARIO: ", auth?.user);

      // --- Rutas de autenticación ---
      // const isAuthRoute = pathname.startsWith("/auth/");
      // if (isLoggedIn && isAuthRoute) {
      //   return Response.redirect(new URL("/", nextUrl));
      // }

      console.log("aaaaaaaaaaaaaaaaaaa ESTA LOGUEADO: ", isLoggedIn);

      // --- Protección general (requiere login) ---
      const isProtectedRoute = authenticatedRoutes.some((route) =>
        pathname.startsWith(route)
      );
      if (isProtectedRoute && !isLoggedIn) {
        const loginUrl = new URL("/auth/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", pathname);
        console.log("RETURRRRRRRRRRRRRRRRRRn");
        return Response.redirect(loginUrl);
      }

      // --- Protección admin ---
      // 👇 Aquí hacemos una verificación más estricta para evitar que /expense/new entre
      const isAdminRoute =
        adminRoutes.some(
          (route) => pathname === route || pathname.startsWith(route + "/")
        ) && !pathname.startsWith("/expense/new");

      if (isAdminRoute) {
        if (!isLoggedIn) {
          console.log("RETURRRRRRRRRRRRRRRRRRn222222222222222222");
          return false;
        }
        console.log(
          "bbbbbbbbbbbbbbbb Está logueado el usuario, con el rol: ",
          userRole
        );
        const allowedRoles = ["admin", "super-user"];
        if (userRole && allowedRoles.includes(userRole)) {
          console.log("ENTRO A LA COCOCOCOCOCNDICION");
          return true;
        }
        console.log("POR ALGUN MOTIVO NO ENTRA");
        return Response.redirect(new URL("/", nextUrl));
      } else {
        console.log(
          `${pathname} ccccccccccccc No es admin route, con el rol: `,
          userRole
        );
        // --- Permitir todo lo demás ---
        return true;
      }
    },
    jwt({ token, user }) {
      if (user) {
        token.data = user;
      }

      return token;
    },

    session({ session, token, user }) {
      session.user = token.data as any;
      return session;
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

        // Verificamos si existe en Prisma
        // const existingUser = await prisma.user.findUnique({
        //   where: { email: email.toLowerCase() },
        // });
        //
        // if (!existingUser) return null;

        // Login con Firebase
        const firebaseRes = await loginEmailPassFirebase({ email, password });

        // ✅ Devolvemos un User plano (no el UserCredential)
        return firebaseRes;
      },
    }),
  ],
};

// export const { signIn, signOut, auth: middleware } = NextAuth(authConfig);
export const { signIn, signOut, auth, handlers } = NextAuth(authConfig);
