"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FiHome,
  FiUsers,
  FiPackage,
  FiUser,
} from "react-icons/fi";

export default function Sidebar() {
  const menuItems = [
    { name: "Dashboard", icon: <FiHome />, link: "/service-man/dashboard" },
    { name: "User Requests", icon: <FiUsers />, link: "/service-man/userrequest" },
    { name: "Products", icon: <FiPackage />, link: "/service-man/products" },
    { name: "Profile", icon: <FiUser />, link: "/service-man/profile" },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 h-screen sticky top-0 shadow-md border-r">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-6">HomeFixer</h2>
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.link}
              className="flex items-center gap-3 px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
