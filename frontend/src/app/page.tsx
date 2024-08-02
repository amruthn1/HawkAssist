"use client"
import { init } from "@/actions/init";
import { useEffect, useState } from "react";
import Loader from "./components/Loader";
import App from "./components/App";

export default function Main() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    init().then(() => {
      setIsLoaded(true)
    })
  }, [])

  return (
    isLoaded ? <App /> : <Loader />
  )
}
