"use client"

import { useState } from "react"
import { ShoppingCart, Search, Menu, X, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"

// Placeholder user (replace with context later)
const mockUser = {
  displayName: "Jane Doe",
  email: "jane@example.com",
  photoURL: "https://ui-avatars.com/api/?name=Jane+Doe&background=10b981&color=fff"
}

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const user = mockUser // Replace with context later

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Wood & Whimsy
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
              Home
            </a>
            <a href="#categories" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
              Furniture
            </a>
            <a
              href="#cafe"
              className="text-gray-700 hover:text-emerald-600 transition-colors font-medium flex items-center gap-1"
            >
              <Coffee className="w-4 h-4" />
              Café
            </a>
            <a href="#about" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
              About
            </a>
            <a href="#contact" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium">
              Contact
            </a>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-emerald-600">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-emerald-600 relative">
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 bg-emerald-500">
                  {cartCount}
                </Badge>
              )}
            </Button>

            {/* User Profile */}
            {user ? (
              <div className="user-profile flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full shadow-sm hover:bg-emerald-100 transition-all">
                <img
                  src={user.photoURL}
                  alt={user.displayName || user.email}
                  className="user-avatar w-8 h-8 rounded-full border-2 border-emerald-400 object-cover"
                />
                <span className="user-name font-medium text-gray-800 max-w-[120px] truncate">
                  {user.displayName || user.email.split("@")[0]}
                </span>
                <button
                  className="logout-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold ml-2 transition-all"
                  // onClick={logoutFunction}
                >
                  Logout
                </button>
              </div>
            ) : (
              <a href="/signin" className="text-emerald-600 font-semibold px-4 py-2 rounded-full border border-emerald-200 hover:bg-emerald-50 transition-all">
                Sign In
              </a>
            )}

            {/* Mobile menu button */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-emerald-100">
            <div className="flex flex-col space-y-3">
              <a href="#home" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium py-2">
                Home
              </a>
              <a href="#categories" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium py-2">
                Furniture
              </a>
              <a
                href="#cafe"
                className="text-gray-700 hover:text-emerald-600 transition-colors font-medium py-2 flex items-center gap-2"
              >
                <Coffee className="w-4 h-4" />
                Café
              </a>
              <a href="#about" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium py-2">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-emerald-600 transition-colors font-medium py-2">
                Contact
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
