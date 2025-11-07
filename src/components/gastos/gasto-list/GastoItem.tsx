import { EventoGasto, Gasto } from "@/interfaces";
import { format } from "date-fns";

interface Props {
  evento: EventoGasto;
}

export default function GastoItem({ evento }: Props) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 flex flex-col gap-2">
      <p className="text-gray-500">
        Estado: {evento.status} | Creado:{" "}
        {format(new Date(evento.createdAt), "dd/MM/yyyy HH:mm")}
      </p>

      {(evento.gastos || []).map((gasto: Gasto, index: number) => (
        <div
          key={index}
          className="flex justify-between items-center border-t pt-2 mt-2"
        >
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {gasto.amount.toLocaleString("es-CL", {
                style: "currency",
                currency: "CLP",
              })}
            </h2>
            <p className="text-gray-500">
              Ministerio:{" "}
              {gasto.distribution?.map((d) => d.ministeryId).join(", ")}
            </p>
          </div>
          <div>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
              {gasto.distribution
                ?.map((d) => (d.approvedByDirector ? "Aprobado" : "Pendiente"))
                .join(", ")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
