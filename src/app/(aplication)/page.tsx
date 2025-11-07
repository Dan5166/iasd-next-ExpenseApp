export const revalidate = 60; // 1 minute

import { Title } from "@/components";

// interface Props {
//   searchParams: {
//     page?: string;
//   };
// }

export default async function Home() {
  // { searchParams }: Props
  // const resolvedParams = await searchParams;

  // const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1;

  return (
    <div className="container p-2 mx-auto">
      <Title
        title="Expense App"
        subtitle="Pagina de ingreso y administracion de gastos de IASD Las Condes"
        className="mb-2"
      />
    </div>
  );
}
