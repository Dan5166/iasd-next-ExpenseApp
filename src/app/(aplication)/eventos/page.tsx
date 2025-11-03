import Link from "next/link";
import { fetchEventos } from "@/actions/evento/fetchEventos";
import { adminDB } from "@/lib/firebaseAdmin";
import { format } from "date-fns";
import { es } from "date-fns/locale";

async function getTotalForEvento(gastoIds: string[]): Promise<number> {
  if (!gastoIds.length) return 0;

  const gastosSnapshots = await Promise.all(
    gastoIds.map((id) => adminDB.collection("gastos").doc(id).get())
  );

  const total = gastosSnapshots.reduce((sum, doc) => {
    const data = doc.data();
    return sum + (data?.amount || 0);
  }, 0);

  return total;
}

export default async function Page() {
  const res = await fetchEventos();

  if (!res.success) {
    return (
      <div className="p-8 text-red-600">
        Error cargando eventos: {res.error}
      </div>
    );
  }

  const eventos = res.data;

  const eventosConTotales = await Promise.all(
    eventos.map(async (evento) => ({
      ...evento,
      total: await getTotalForEvento(evento.gastoIds),
    }))
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-800">Eventos</h1>
        <div className="flex gap-4">
          <Link
            href="/expense/new"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            + Gasto
          </Link>

          <Link
            href="/event/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            + Evento
          </Link>
        </div>
      </div>

      {eventosConTotales.length === 0 ? (
        <p className="text-gray-500">No hay eventos registrados.</p>
      ) : (
        <div className="grid gap-4">
          {eventosConTotales.map((evento) => (
            <Link
              key={evento.id}
              href={`/evento/${evento.id}`}
              className="block border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="font-medium text-lg">{evento.nombre}</h2>
                  <p className="text-sm text-gray-600">
                    Fecha:{" "}
                    {evento.fecha
                      ? format(
                          new Date(evento.fecha),
                          "dd 'de' MMMM yyyy, HH:mm",
                          {
                            locale: es,
                          }
                        )
                      : "Sin fecha"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Gastos asignados: {evento.gastoIds.length}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-semibold text-indigo-600">
                    {evento.total.toLocaleString("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    })}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                Creado:{" "}
                {evento.createdAt
                  ? format(new Date(evento.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: es,
                    })
                  : "-"}
                {" · "}
                Actualizado:{" "}
                {evento.updatedAt
                  ? format(new Date(evento.updatedAt), "dd/MM/yyyy HH:mm", {
                      locale: es,
                    })
                  : "-"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
