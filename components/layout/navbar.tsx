'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

export function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-gray-900">
            <span className="text-indigo-600 text-xl">✦</span>
            InterviewAI
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              About
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="secondary">Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary">Get Started</Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 py-4 flex flex-col gap-4">
          <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900" onClick={() => setOpen(false)}>
            Features
          </Link>
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900" onClick={() => setOpen(false)}>
            Pricing
          </Link>
          <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900" onClick={() => setOpen(false)}>
            About
          </Link>
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-200">
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button variant="secondary" className="w-full">Login</Button>
            </Link>
            <Link href="/register" onClick={() => setOpen(false)}>
              <Button variant="primary" className="w-full">Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
