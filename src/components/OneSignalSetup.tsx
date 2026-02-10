"use client";
import { useEffect } from "react";
import OneSignal from "react-onesignal";

export default function OneSignalSetup() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        OneSignal.init({
          appId: "9592f092-45d8-41d3-a780-0e2ea8bbc126",
          allowLocalhostAsSecureOrigin: true,
          notifyButton: {
            enable: true,
            position: "bottom-right",
            theme: "dark"
          } as any
        });
      } catch (e) { console.error(e); }
    }
  }, []);
  return null;
}
