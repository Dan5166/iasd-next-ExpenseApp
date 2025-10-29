export interface Distribution {
  ministeryId: string;
  percent: number;
  approvedByDirector: boolean;
}

export interface Gasto {
  status?: string;
  amount: number;
  createdAt?: Date;
  distribution: Distribution[];
}

export interface EventoGasto {
  createdAt: Date;
  modified: Date;
  status: string;
  gastos: Gasto[];
}
