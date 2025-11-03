"use client";

import { logout } from "@/actions";
import { useUIStore } from "@/store";
import clsx from "clsx";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  IoBarChartOutline,
  IoCalendarOutline,
  IoCloseOutline,
  IoLogInOutline,
  IoLogOutOutline,
  IoPeopleOutline,
  IoPersonOutline,
  IoSearchOutline,
  IoWalletOutline,
} from "react-icons/io5";

export function Sidebar() {
  const isSideMenuOpen = useUIStore((state) => state.isSideMenuOpen);
  const closeMenu = useUIStore((state) => state.closeSideMenu);

  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const isAdmin = session?.user.role === "admin";

  const handleLogout = async () => {
    await logout();
    console.log("------- LOGOUT");
    window.location.replace("/auth/login");
  };

  return (
    <div>
      {/* Background black */}
      {isSideMenuOpen && (
        <div className="fixed top-0 left-0 w-screen z-10 bg-black opacity-30" />
      )}

      {/* Blur */}
      {isSideMenuOpen && (
        <div className="fade-in fixed top-0 w-screen h-screen z-10 backdrop-filter backdrop-blur-sm" />
      )}

      {/* Sidemenu */}
      <nav
        // TODO: Efecto de slide
        className={clsx(
          "fixed p-5 right-0 top-0 w-[500px] h-screen bg-white z-20 shadow-2xl transform transition-all duration-300",
          {
            "translate-x-full": !isSideMenuOpen,
          }
        )}
      >
        <IoCloseOutline
          size={50}
          className="absolute top-5 right-5 cursor-pointer"
          onClick={() => {
            closeMenu();
          }}
        />
        {/* Input */}
        <div className="relative mt-14">
          <IoSearchOutline size={20} className="absolute top-2 left-2" />
          <input
            type="text"
            placeholder="Buscar"
            className="w-full bg-gray-50 rounded pl-10 py-1 pr-10 border-b-2 border-gray-200 focus:outline-none focus:border-blue-500"
          />
        </div>
        {/* Menu */}
        {isAuthenticated && (
          <>
            <Link
              href="/profile"
              onClick={() => {
                closeMenu();
              }}
              className="flex items-center mt-10 p-2 hover:bg-gray-100 rounded transition-all"
            >
              <IoPersonOutline size={30} />
              <span className="ml-3 text-xl">Perfil</span>
            </Link>
          </>
        )}

        {!isAuthenticated && (
          <Link
            href="/auth/login"
            onClick={() => {
              closeMenu();
            }}
            className="flex items-center mt-10 p-2 hover:bg-gray-100 rounded transition-all"
          >
            <IoLogInOutline size={30} />
            <span className="ml-3 text-xl">Ingresar</span>
          </Link>
        )}
        {isAuthenticated && (
          <>
            <Link
              href="/eventos"
              onClick={() => {
                closeMenu();
              }}
              className="flex items-center mt-10 p-2 hover:bg-gray-100 rounded transition-all"
            >
              <IoCalendarOutline size={30} />
              <span className="ml-3 text-xl">Eventos</span>
            </Link>
            <Link
              href="/gastos"
              onClick={() => {
                closeMenu();
              }}
              className="flex items-center mt-10 p-2 hover:bg-gray-100 rounded transition-all"
            >
              <IoWalletOutline size={30} />
              <span className="ml-3 text-xl">Gastos</span>
            </Link>
            <button
              className="flex w-full items-center mt-10 p-2 hover:bg-gray-100 rounded transition-all"
              onClick={() => {
                handleLogout();
                closeMenu();
              }}
            >
              <IoLogOutOutline size={30} />
              <span className="ml-3 text-xl">Salir</span>
            </button>
          </>
        )}
        {isAdmin && (
          <>
            {/* Line Separator */}
            <div className="w-full h-px bg-gray-200 my-10" />
            <Link
              href="/"
              className="flex items-center mt-10 p-2 hover:bg-gray-100 rounded transition-all"
            >
              <IoBarChartOutline size={30} />
              <span className="ml-3 text-xl">Dashboard</span>
            </Link>
            <Link
              href="/"
              className="flex items-center mt-10 p-2 hover:bg-gray-100 rounded transition-all"
            >
              <IoPeopleOutline size={30} />
              <span className="ml-3 text-xl">Admin</span>
            </Link>
          </>
        )}
      </nav>
    </div>
  );
}
