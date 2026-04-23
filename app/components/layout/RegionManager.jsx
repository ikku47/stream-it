"use client";

import { useEffect } from "react";
import useStore from "@/store/useStore";

export default function RegionManager() {
  const { region, setRegion } = useStore();

  useEffect(() => {
    async function fetchRegion() {
      if (region) return;

      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data && data.country_code) {
          console.log("Region detected:", data.country_code);
          setRegion(data.country_code);
        }
      } catch (err) {
        console.error("Failed to fetch region:", err);
      }
    }

    fetchRegion();
  }, [region, setRegion]);

  return null;
}
