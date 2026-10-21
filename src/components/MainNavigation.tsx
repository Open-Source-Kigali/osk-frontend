import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { RxHamburgerMenu } from "react-icons/rx";
import { X, Sun, Moon } from "lucide-react";
import LogoImage from "@/assets/Logo/OSK-primary-logo.svg";
import LogoWhite from "@/assets/Logo/OSK-primary-logo-1200-400-white.svg";
import { useScrolled } from "@/hooks";
import { NAV_LINKS } from "@/constants";
import PrimaryButton from "@/components/UI/PrimaryButton";
import primaryCTALink from '@/config/links'

const Navbar = () => {
  const scrolled = useScrolled(50);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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
        className={`flex justify-between items-center px-4 sm:px-0 lg:px-20 fixed py-4 w-full z-20 transition-colors duration-300 ${isLight
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

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center space-x-8 text-base">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                isActive
                  ? "text-primary-colour font-semibold underline underline-offset-4 decoration-2"
                  : `font-medium transition-colors duration-200 ${
                      isLight
                        ? "text-gray-900 hover:text-primary-colour"
                        : "text-white hover:text-[#93bbff]"
                    }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {/* Donate button — Mozilla-style, stands out from nav links */}
          <NavLink
            to="/donate"
            className={({ isActive }) =>
              `inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold border-2 transition-all duration-200 hover:scale-105 ${
                isActive
                  ? "bg-primary-colour border-primary-colour text-white"
                  : isLight
                    ? "border-primary-colour text-primary-colour hover:bg-primary-colour hover:text-white"
                    : "border-white/60 text-white hover:bg-primary-colour hover:border-primary-colour"
              }`
            }
          >
            ❤️ Donate
          </NavLink>

          {/* Dark/Light mode toggle (mock — local state only for now) */}
          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            aria-pressed={darkMode}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className={`p-2 rounded-full border transition-colors duration-200 ${
              isLight
                ? "border-gray-300 text-gray-900 hover:bg-gray-100"
                : "border-white/40 text-white hover:bg-white/10"
            }`}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* CTA button (desktop) */}
        <PrimaryButton
          to={primaryCTALink.primaryCTA}
          className="hidden md:inline-flex items-center justify-center h-12 px-6 text-sm font-medium whitespace-nowrap rounded-full"
        >
          Contribute to OSK
        </PrimaryButton>
        {/* Mobile hamburger */}
        <button
          className="md:hidden z-50 p-1"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
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
              className={({ isActive }) =>
                isActive
                  ? "text-primary-colour font-semibold underline underline-offset-4 decoration-2"
                  : "text-black hover:text-primary-colour transition-colors duration-200"
              }
            >
              {link.name}
            </NavLink>
          ))}

          {/* Donate button (mobile) */}
          <NavLink
            to="/donate"
            onClick={() => setMobileOpen(false)}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full text-sm font-bold border-2 border-primary-colour text-primary-colour hover:bg-primary-colour hover:text-white transition-all duration-200"
          >
            ❤️ Donate
          </NavLink>

          {/* CTA button (mobile) */}
          <PrimaryButton to="https://docs.google.com/forms/d/e/1FAIpQLSfP6ysp6y_SNcuHb1x9v-nMxfXR7-kcyBogN2ZMF--2byOzyg/viewform">Contribute to OSK</PrimaryButton>

          {/* Dark/Light mode toggle (mock — local state only for now) */}
          <button
            type="button"
            onClick={() => setDarkMode((d) => !d)}
            aria-pressed={darkMode}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            className="p-2 rounded-full border border-gray-300 text-gray-900 hover:bg-gray-100 transition-colors duration-200"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;
