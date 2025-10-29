export const revalidate = 604800; // 7 dias

import { getProductBySlug } from "@/actions";
import {
  ProductSlideshow,
  ProductMobileSlideshow,
  SizeSelector,
  QuantitySelector,
  StockLabel,
} from "@/components";
import { titleFont } from "@/config/fonts";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import AddToCart from "./ui/AddToCart";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = (await params).slug;

  // fetch product
  const product = await getProductBySlug(slug);

  // const previousImages = (await parent).openGraph?.images || [];

  return {
    title: product?.title ?? "Producto no encontrado",
    description: product?.description ?? "",
    openGraph: {
      title: product?.title ?? "Producto no encontrado",
      description: product?.description ?? "",
      images: [`/products/${product?.images[1]}`],
    },
  };
}

export default async function page({ params }: Props) {
  // Esperamos la promesa
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const product = await getProductBySlug(slug);

  if (!product) {
    return notFound();
  }
  return (
    <div className="mt-5 mb-20 grid md:grid-cols-3 gap-3">
      {/* Mobile SlideShow */}
      <ProductMobileSlideshow
        title={product.title}
        images={product.images}
        className="block md:hidden"
      />
      {/* Desktop SlideShow */}
      <div className="col-span-1 md:col-span-2">
        <ProductSlideshow
          title={product.title}
          images={product.images}
          className="hidden md:block"
        />
      </div>
      {/* Detalles */}
      <div className="col-span-1">
        <StockLabel slug={product.slug} />
        <h1 className={`${titleFont.className} antialiased font-bold text-xl`}>
          {product.title}
        </h1>
        <p className="text-lg mb-5">${product.price}</p>
        <AddToCart product={product} />
        {/* Descripcion */}
        <h3 className="font-bold text-sm">Descripcion</h3>
        <p className="font-light">{product.description}</p>
      </div>
    </div>
  );
}
