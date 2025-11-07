import { adminDB } from "@/lib/firebaseAdmin";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import EditarEventoForm from "./ui/EditEventoForm";
import { Timestamp } from "firebase-admin/firestore";

type FirestoreDateInput = Timestamp | string | number | Date | null | undefined;

interface Evento {
  nombre: string;
  fecha: Timestamp | Date | string | number;
  createdAt: Timestamp | Date | string | number;
  updatedAt: Timestamp | Date | string | number;
  gastoIds: string[];
}

// TODO: Mejorar sintaxis, revisar efectivamente el tipo
function parseFirestoreDate(dateValue: FirestoreDateInput): Date | null {
  if (!dateValue) return null;

  if (dateValue instanceof Timestamp) {
    return dateValue.toDate();
  }

  if (typeof dateValue === "string" || typeof dateValue === "number") {
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  if (dateValue instanceof Date) {
    return dateValue;
  }

  return null;
}

export default async function EventoDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const paramsAwaited = await params;
  // 🔹 Obtenemos el evento
  const eventoSnap = await adminDB
    .collection("eventos")
    .doc(paramsAwaited.id)
    .get();

  if (!eventoSnap.exists) {
    return <div className="p-8 text-red-600">Evento no encontrado.</div>;
  }

  const evento = eventoSnap.data() as Evento;

  const fecha = parseFirestoreDate(evento.fecha);
  const createdAt = parseFirestoreDate(evento.createdAt);
  const updatedAt = parseFirestoreDate(evento.updatedAt);

  // 🔹 Si tiene gastos asignados, los obtenemos
  let gastos: {
    id: string;
    description: string;
    amount: number;
    status?: string;
    eventId?: string;
    createdAt?: string | null;
    receiptUrl: string;
  }[] = [];

  if (evento.gastoIds && evento.gastoIds.length > 0) {
    const gastoDocs = await Promise.all(
      evento.gastoIds.map((id) => adminDB.collection("gastos").doc(id).get())
    );

    gastos = gastoDocs
      .filter((doc) => doc.exists)
      .map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          description: data?.description ?? "(Sin descripción)",
          amount: data?.amount ?? 0,
          status: data?.status ?? "desconocido",
          eventId: data?.eventId ?? null,
          createdAt: data?.createdAt
            ? data.createdAt.toDate().toISOString()
            : null,
          receiptUrl: data?.receiptUrl || "#",
        };
      });
  }

  const total = gastos.reduce((sum, g) => sum + g.amount, 0);

  return (
    <div className="p-8 space-y-6">
      {/* 🔹 Info general del evento */}
      <div className="border border-gray-200 rounded-xl p-6">
        <EditarEventoForm
          evento={{
            id: paramsAwaited.id,
            nombre: evento.nombre || "",
            fecha: fecha ? fecha.toISOString() : "",
            gastoIds: evento.gastoIds || [],
          }}
        />

        <div className="space-y-1 text-gray-700">
          <p>
            <span className="font-medium">Fecha:</span>{" "}
            {fecha
              ? format(fecha, "dd 'de' MMMM yyyy, HH:mm", { locale: es })
              : "Sin fecha"}
          </p>

          <p>
            <span className="font-medium">Creado:</span>{" "}
            {createdAt
              ? format(createdAt, "dd/MM/yyyy HH:mm", { locale: es })
              : "-"}
          </p>

          <p>
            <span className="font-medium">Actualizado:</span>{" "}
            {updatedAt
              ? format(updatedAt, "dd/MM/yyyy HH:mm", { locale: es })
              : "-"}
          </p>

          <p>
            <span className="font-medium">Gastos asignados:</span>{" "}
            {gastos.length}
          </p>
        </div>
      </div>

      {/* 🔹 Lista de gastos */}
      <div>
        <h2 className="text-xl font-semibold mb-3">Gastos</h2>

        {gastos.length === 0 ? (
          <p className="text-gray-500">
            No hay gastos asociados a este evento.
          </p>
        ) : (
          <div className="space-y-2">
            {gastos.map((g) => (
              <a
                href={g.receiptUrl}
                target="_blank"
                key={g.id}
                className="p-4 flex justify-between items-center hover:bg-gray-50 transition border border-gray-100 rounded-lg"
              >
                <div>
                  <p className="font-medium">
                    {g.amount.toLocaleString("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {g.description || "Sin descripción"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {g.createdAt
                      ? new Date(g.createdAt).toLocaleString("es-CL")
                      : "Fecha desconocida"}
                  </p>
                </div>

                <div className="text-right">
                  <p
                    className={`text-xs font-semibold uppercase ${
                      g.status === "approved"
                        ? "text-green-600"
                        : g.status === "draft"
                        ? "text-gray-500"
                        : "text-yellow-600"
                    }`}
                  >
                    {g.status}
                  </p>
                  {g.eventId ? (
                    <p className="text-xs text-indigo-600 mt-1">
                      Evento: {g.eventId}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 mt-1">Sin asignar</p>
                  )}
                </div>
              </a>
            ))}

            <div className="flex justify-between items-center border-t pt-3 mt-3">
              <p className="font-semibold text-gray-800">Total</p>
              <p className="text-xl font-bold text-indigo-700">
                {total.toLocaleString("es-CL", {
                  style: "currency",
                  currency: "CLP",
                })}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
