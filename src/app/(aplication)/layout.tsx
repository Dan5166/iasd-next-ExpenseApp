import { Footer, Sidebar, TopMenu } from "@/components";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Top menu fijo arriba si quieres */}
      <TopMenu />

      {/* Sidebar si es fija puedes ponerla fuera del flujo o usar grid */}
      <Sidebar />

      {/* Contenido principal: ocupa todo el espacio restante */}
      <div className="flex-1 px-0 sm:px-10">{children}</div>

      {/* Footer siempre abajo */}
      <Footer />
    </main>
  );
}
