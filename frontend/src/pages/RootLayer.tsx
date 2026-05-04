import { useEffect } from "react"
import { Outlet, useLocation } from "react-router"
import MainNavigation from "../components/MainNavigation"
import Footer from "../components/Footer"

const RootLayer = () => {
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior })
  }, [location.pathname])

  return (
    <>
      <MainNavigation />
      <main key={location.pathname} className="page-fade">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default RootLayer
