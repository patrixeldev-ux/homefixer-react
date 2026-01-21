"use client";

import Link from "next/link";
import { useState } from "react";
import {
  FiHome,
  FiShoppingCart,
  FiUsers,
  FiSettings,
  FiChevronDown,
} from "react-icons/fi";

export default function Sidebar() {
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  const menuItems = [
    { name: "Dashboard", icon: <FiHome />, link: "/vendor/dashboard" },
    { name: "Orders", icon: <FiShoppingCart />, link: "/vendor/orders" },
    { name: "Products", icon: <FiUsers />, link: "/vendor/products" },
    {
      name: "Settings",
      icon: <FiSettings />,
      subMenu: [
        { name: "Profile", link: "/vendor/settings" },
        { name: "Security", link: "/vendor/settings/security" },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 h-screen sticky top-0 shadow-md border-r">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-blue-600 mb-6">HomeFixer</h2>
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <div key={item.name}>
              {!item.subMenu ? (
                <Link
                  href={item.link}
                  className="flex items-center gap-3 px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ) : (
                <div>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-2 rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <span className="flex items-center gap-3">
                      {item.icon} {item.name}
                    </span>
                    <FiChevronDown
                      className={`transition-transform ${
                        openMenus[item.name] ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </button>
                  {openMenus[item.name] && (
                    <div className="flex flex-col ml-8 mt-1 gap-1">
                      {item.subMenu.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.link}
                          className="px-4 py-1 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
