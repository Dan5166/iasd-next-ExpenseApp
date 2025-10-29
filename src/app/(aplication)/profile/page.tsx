import { auth } from "@/auth.config";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  const user = session.user;

  return (
    <div className="flex justify-center items-center min-h-[80vh] bg-gray-50">
      <div className="bg-white shadow-md rounded-2xl p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="relative w-28 h-28">
            <Image
              src={user.image ?? "/default-avatar.png"} // puedes crear esta imagen en /public
              alt={user.name ?? "Usuario"}
              fill
              className="rounded-full object-cover border-4 border-indigo-200"
            />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-800">
          {user.name ?? "Usuario sin nombre"}
        </h1>
        <p className="text-gray-500">{user.email}</p>

        <div className="mt-6">
          <span className="inline-block bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
            {user.role ?? "Usuario"}
          </span>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">
            Editar perfil
          </button>
          <button className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
