"use client";

import { useEffect } from "react";
import useStore from "@/store/useStore";

export default function RegionManager() {
  const { region, setRegion } = useStore();

  useEffect(() => {
    async function fetchRegion() {
      if (region) return;

      try {
        const res = await fetch("http://ip-api.com/json");
        const data = await res.json();
        if (data && data.countryCode) {
          console.log("Region detected:", data.countryCode);
          setRegion(data.countryCode);
        }
      } catch (err) {
        console.error("Failed to fetch region:", err);
      }
    }

    fetchRegion();
  }, [region, setRegion]);

  return null;
}
