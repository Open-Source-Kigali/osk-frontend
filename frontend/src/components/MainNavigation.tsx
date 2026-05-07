import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { RxHamburgerMenu } from "react-icons/rx";
import { X } from "lucide-react";

import LogoImage from "@/assets/Logo/OSK-primary-logo.svg";
import LogoWhite from "@/assets/Logo/OSK-primary-logo-1200-400-white.svg"
import { useScrolled } from "@/hooks";
import { NAV_LINKS } from "@/constants";
import PrimaryButton from "./UI/PrimaryButton";





const Navbar = () => {
  const scrolled = useScrolled(50);
const [mobileOpen, setMobileOpen] = useState(false);

const location = useLocation();
const isHome = location.pathname === "/";

const isLight = !isHome || scrolled;

const showWhiteLogo = isHome && !scrolled;
const logo = showWhiteLogo ? LogoWhite : LogoImage;

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);



  return (
    <>
      <nav
        className={`flex justify-between items-center px-4 sm:px-8 lg:px-20 fixed py-4 w-full z-20 transition-colors duration-300 ${isLight
          ? "bg-white shadow-xl text-gray-900"
          : "bg-transparent text-white"
          }`}
      >
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src={logo}
            alt="Open Source Kigali"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain transition-all duration-300"
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center space-x-8 text-base">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                isActive
                  ? "text-primary-colour font-semibold"
                  : `font-medium transition-colors duration-200 ${isLight
                    ? "text-gray-900 hover:text-primary-colour"
                    : "text-white hover:text-[#93bbff]"
                  }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* CTA button (desktop) */}
        <PrimaryButton to="/membersform" className="hidden md:inline-flex">
          Contribute to OSK
        </PrimaryButton>
        {/* Mobile hamburger */}
        <button
          className="md:hidden z-50 p-1"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className={`w-6 h-6 text-gray-900`} />
          ) : (
            <RxHamburgerMenu
              className={`w-6 h-6 transition-colors duration-300 ${isLight ? "text-gray-900" : "text-white"
                }`}
            />
          )}
        </button>
      </nav>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed top-0 left-0 w-full h-screen bg-white z-10 flex flex-col items-center pt-30 space-y-6 text-lg">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className="text-black"
            >
              {link.name}
            </NavLink>
          ))}

          {/* CTA button (mobile) */}
          <PrimaryButton to="">Contribute to OSK</PrimaryButton>
        </div>
      )}
    </>
  );
};

export default Navbar;
