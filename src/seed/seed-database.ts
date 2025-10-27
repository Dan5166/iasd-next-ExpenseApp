import { initialData } from "./seed";
import prisma from "../lib/prisma";

async function main() {
  // 1- Borrar registros previos
  await prisma.productImage.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  // Categorias

  // await prisma.category.create({
  //   data: {
  //     name: "Shirts",
  //   },
  // });

  const { categories, products, users } = initialData;

  await prisma.user.createMany({
    data: users,
  });

  const categoriesData = categories.map((name) => ({
    name,
  }));

  await prisma.category.createMany({
    data: categoriesData,
  });

  const categoriesDB = await prisma.category.findMany();

  const categoriesMap = categoriesDB.reduce((map, category) => {
    map[category.name.toLowerCase()] = category.id;
    return map;
  }, {} as Record<string, string>);

  // Productos

  const categoryId = categoriesMap["shirts"];
  if (!categoryId) throw new Error("No existe la categoría shirts");

  // await prisma.product.create({
  //   data: {
  //     ...product1,
  //     categoryId,
  //   },
  // });

  products.forEach(async (product) => {
    const { type, images, ...rest } = product;
    const dbProduct = await prisma.product.create({
      data: {
        ...rest,
        categoryId: categoriesMap[type],
      },
    });
    // Images
    const imagesData = images.map((image) => ({
      url: image,
      productId: dbProduct.id,
    }));
    await prisma.productImage.createMany({
      data: imagesData,
    });
  });

  console.log("Seed ejecutada correctamente");
}

(() => {
  if (process.env.NODE_ENV === "production") return;
  main();
})();
