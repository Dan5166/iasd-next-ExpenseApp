export const revalidate = 60;

import { getPaginatedProductsWithImages } from "@/actions";
import { Pagination, ProductGrid, Title } from "@/components";
import { Gender } from "@/generated/prisma";
import { redirect } from "next/navigation";

interface Props {
  params: {
    gender: string;
  };
  searchParams: { page?: string };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  // Esperamos la promesa
  const { gender } = params;
  console.log({ params });

  const page = searchParams.page ? parseInt(searchParams.page) : 1;

  const { products, totalPages } = await getPaginatedProductsWithImages({
    page,
    gender: gender as Gender,
  });

  if (products.length === 0) {
    redirect("/");
  }

  // if (id === "kids") {
  //   notFound();
  // }

  const labels: Record<string, string> = {
    men: "para hombres",
    women: "para mujeres",
    kid: "para ninos",
    unisex: "para todos",
  };

  return (
    <>
      <Title
        title={`Articulos ${labels[gender]}`}
        subtitle="Todos los productos"
        className="mb-2"
      />
      <ProductGrid products={products} />
      <Pagination totalPages={totalPages} />
    </>
  );
}
