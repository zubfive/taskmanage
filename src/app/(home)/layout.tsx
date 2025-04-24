"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/trpc/react";
import { CheckSquare, Menu, X, User } from "lucide-react";
import Link from "next/link";
import LogoutButton from "@/app/_components/logout";
import ThemeToggle from "@/app/_components/theme-toggle";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const userData = api.user.getUser.useQuery();

  if (!userData.data) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>;
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col dark:bg-gray-900">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/taskmanage" className="flex items-center text-indigo-600 font-bold text-xl dark:text-indigo-400">
                <CheckSquare className="mr-2" size={24} />
                <span>TaskManager</span>
              </Link>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/taskmanage" 
                className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition dark:text-gray-300 dark:hover:text-indigo-400"
              >
                Tasks
              </Link>
              {userData.data.category === "admin" && (
                <Link 
                  href="/dashboard" 
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition dark:text-gray-300 dark:hover:text-indigo-400"
                >
                  Dashboard
                </Link>
              )}
            </div>

            {/* User menu */}
            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-2 dark:bg-indigo-900 dark:text-indigo-300">
                  <User size={16} />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {userData.data.email}
                </span>
              </div>
              <LogoutButton className="px-3 py-2 rounded-md text-sm font-medium" />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                className="text-gray-500 hover:text-indigo-600 focus:outline-none focus:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                onClick={toggleMenu}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              href="/taskmanage" 
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-indigo-400 dark:hover:bg-gray-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Tasks
            </Link>
            {userData.data.category === "admin" && (
              <Link 
                href="/dashboard" 
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-indigo-400 dark:hover:bg-gray-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <div className="border-t border-gray-200 my-2 dark:border-gray-700"></div>
            <div className="flex items-center px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mr-2 dark:bg-indigo-900 dark:text-indigo-300">
                <User size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {userData.data.email}
              </span>
            </div>
            <LogoutButton className="w-full justify-start px-3 py-2 text-left text-base font-medium" />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 dark:bg-gray-800 dark:border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center text-gray-500 text-sm dark:text-gray-400">
              <CheckSquare className="mr-2" size={16} />
              <span>TaskManager © {new Date().getFullYear()}</span>
            </div>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-indigo-600 transition dark:hover:text-indigo-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition dark:hover:text-indigo-400">Terms of Service</a></li>
                <li><a href="#" className="hover:text-indigo-600 transition dark:hover:text-indigo-400">Contact Us</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 