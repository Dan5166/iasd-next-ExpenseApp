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
];

// Rutas que requieren que el usuario tenga un rol de "admin" o "super-user"
const adminRoutes = ["/admin", "/admin/products", "/admin/users"];

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/new-account",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const { pathname } = nextUrl;
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role; // Asume que tienes el rol en el token/sesión

      // ----------------------------------------------------------------------
      // PASO 1: Lógica de Redirección para Rutas de Autenticación
      // ----------------------------------------------------------------------

      // 1a. ¿El usuario está autenticado y está intentando acceder a la página de login/registro?
      // Si está logueado, redirigir fuera de las rutas de auth a la raíz (o a su dashboard)
      const isAuthRoute = pathname.startsWith("/auth/");
      if (isLoggedIn && isAuthRoute) {
        return Response.redirect(new URL("/", nextUrl));
      }

      // 1b. ¿La ruta actual requiere autenticación (login)?
      const isProtectedRoute = authenticatedRoutes.some((route) =>
        pathname.startsWith(route)
      );

      // Si la ruta es protegida y el usuario NO está logueado, redirigir al login.
      if (isProtectedRoute && !isLoggedIn) {
        // Redirigir al login y guardar la URL actual en 'callbackUrl'
        const loginUrl = new URL("/auth/login", nextUrl);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return Response.redirect(loginUrl);
      }

      // ----------------------------------------------------------------------
      // PASO 2: Lógica de Protección por Roles (Admin)
      // ----------------------------------------------------------------------

      // 2a. ¿La ruta actual es una ruta de administración?
      const isAdminRoute = adminRoutes.some((route) =>
        pathname.startsWith(route)
      );

      if (isAdminRoute) {
        // Si no está logueado, automáticamente será redirigido al login por el PASO 1b.
        if (!isLoggedIn) {
          return false; // Forzará la redirección al login (pages.signIn)
        }

        // Definir los roles permitidos
        const allowedRoles = ["admin", "super-user"];

        // Verificar si el rol del usuario está en los roles permitidos
        if (userRole && allowedRoles.includes(userRole)) {
          return true; // Acceso concedido
        }

        // Si está logueado pero no tiene el rol correcto, denegar acceso.
        // Puedes redirigir a una página 403 o a la raíz.
        return Response.redirect(new URL("/", nextUrl));
      }

      // ----------------------------------------------------------------------
      // PASO 3: Por defecto
      // ----------------------------------------------------------------------

      // Permitir el acceso a todas las demás rutas (públicas)
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.data = user;
        return token;
      }
      return token;
    },
    session({ session, token, user }) {
      // Aca podemos agregar cambios por ejemplo si queremos que se revise constantemente en base de datos
      // si el user esta bloqueado, etc
      console.log({ session, token, user });
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
