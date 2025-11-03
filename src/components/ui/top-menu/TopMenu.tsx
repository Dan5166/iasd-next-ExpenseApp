"use client";
import { useEffect, useState } from "react";

import Link from "next/link";
import { IoSearchOutline, IoCartOutline } from "react-icons/io5";

import { titleFont } from "@/config/fonts";
import { useCartStore, useUIStore } from "@/store";
import { useSession } from "next-auth/react";
// import { useCartStore, useUIStore } from "@/store";

export const TopMenu = () => {
  const openMenu = useUIStore((state) => state.openSideMenu);
  const totalItemsInCart = useCartStore((state) => state.getTotalItems());

  const [loaded, setLoaded] = useState(false);

  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const isAdmin = session?.user.role === "admin";

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <nav className="flex px-5 justify-between items-center w-full">
      {/* Logo */}
      <div>
        <Link href="/">
          <span className={`${titleFont.className} antialiased font-bold`}>
            IASD
          </span>
          <span> | ExpenseApp</span>
        </Link>
      </div>

      {/* Center Menu */}
      <div className="hidden sm:block">
        {isAuthenticated && (
          <Link
            className="m-2 p-2 rounded-md transition-all hover:bg-gray-100"
            href="/expense/new"
          >
            Agregar Gasto
          </Link>
        )}
        {isAuthenticated && (
          <Link
            className="m-2 p-2 rounded-md transition-all hover:bg-gray-100"
            href="/eventos"
          >
            Eventos
          </Link>
        )}
      </div>

      {/* Search, Cart, Menu */}
      <div className="flex items-center">
        <Link href="/search" className="mx-2">
          <IoSearchOutline className="w-5 h-5" />
        </Link>

        {/* <Link
          href={totalItemsInCart === 0 && loaded ? "/empty" : "/cart"}
          className="mx-2"
        >
          <div className="relative">
            {loaded && totalItemsInCart > 0 && (
              <span className="fade-in absolute text-xs px-1 rounded-full font-bold -top-2 -right-2 bg-blue-700 text-white">
                {totalItemsInCart}
              </span>
            )}
            <IoCartOutline className="w-5 h-5" />
          </div>
        </Link> */}

        <button
          onClick={() => {
            openMenu();
          }}
          className="m-2 p-2 rounded-md transition-all hover:bg-gray-100"
        >
          Menú
        </button>
      </div>
    </nav>
  );
};
