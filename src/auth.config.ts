import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { loginEmailPassFirebase } from "./lib/firebaseClient";
import { adminAuth } from "./lib/firebaseAdmin";

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
        // 1️⃣ Validar los datos de entrada
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (!parsedCredentials.success) return null;

        const { email, password } = parsedCredentials.data;

        try {
          console.log("🔥 Intentando login con Firebase:", email);

          // 2️⃣ Iniciar sesión con Firebase (SDK cliente)
          const { userData, idToken } = await loginEmailPassFirebase({
            email,
            password,
          });

          // 3️⃣ Verificar el ID token con Firebase Admin (en el servidor)
          const decodedToken = await adminAuth.verifyIdToken(idToken);

          // 4️⃣ Retornar un objeto plano que NextAuth guardará como sesión
          return {
            id: decodedToken.uid,
            email: decodedToken.email,
            name: userData.name,
            role: userData.role,
            emailVerified: decodedToken.email_verified,
            image: userData.image,
          };
        } catch (err) {
          console.error("❌ Error en authorize Firebase:", err);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
    updateAge: 24 * 60 * 60, // se refresca cada 24h
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 días también (coincidir con session)
  },
};

// export const { signIn, signOut, auth: middleware } = NextAuth(authConfig);
export const { signIn, signOut, auth, handlers } = NextAuth(authConfig);
