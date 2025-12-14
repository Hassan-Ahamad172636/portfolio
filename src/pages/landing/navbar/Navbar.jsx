import React from 'react'
import { Link } from 'react-router-dom'

function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 backdrop-blur-lg bg-gray-950/70 border-b border-gray-800 text-white">
            <div className="max-w-5xl mx-auto px-6 py-5 flex justify-between items-center">
                <h1 className="text-2xl font-bold">DevName</h1>
                <div className="space-x-10">
                    <a href="#about" className="hover:text-cyan-400 transition">About</a>
                    <a href="#projects" className="hover:text-cyan-400 transition">Projects</a>
                    <a href="#contact" className="hover:text-cyan-400 transition">Contact</a>
                </div>
            </div>
        </nav>
    )
}

export default Navbar