export interface Distribution {
  ministeryId: string;
  percent: number;
  approvedByDirector: boolean;
}

export interface Gasto {
  status: "draft" | "submitted" | "approved";
  amount: number;
  distribution: {
    ministeryId: string;
    percent: number;
    approvedByDirector: boolean;
  }[];
  receiptUrl?: string; // 🔹 enlace a la boleta en Storage
  description?: string;
  eventId?: string | null;
  userId?: string;
}

export interface EventoGasto {
  createdAt: Date;
  modified: Date;
  status: string;
  gastos: Gasto[];
}
