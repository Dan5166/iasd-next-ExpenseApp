import type { Metadata } from "next";
import "./globals.css";
import { inter } from "@/config/fonts";
import { Provider } from "@/components";

export const metadata: Metadata = {
  title: {
    template: "%s - Iasd | ExpenseApp",
    default: "Home - Iasd | ExpenseApp",
  },
  description:
    "Pagina de ingreso y administracion de gastos de IASD Las Condes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
