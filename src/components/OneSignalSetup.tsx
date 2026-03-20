"use client";
import { useEffect, useRef } from "react";
import OneSignal from "react-onesignal";

export default function OneSignalSetup() {
  const isInitialized = useRef(false);

  useEffect(() => {
    // Odpalamy tylko po stronie przeglądarki i tylko JEDEN RAZ
    if (typeof window !== "undefined" && !isInitialized.current) {
      isInitialized.current = true;
      
      const runOneSignal = async () => {
        try {
          await OneSignal.init({
            appId: "9592f092-45d8-41d3-a780-0e2ea8bbc126",
            allowLocalhostAsSecureOrigin: true,
            notifyButton: {
              enable: true,
              position: "bottom-right",
              theme: "dark"
            }
          });
          
          // Wymuszenie pokazania okienka (Slidedown) z pytaniem o zgodę
          OneSignal.Slidedown.promptPush();
        } catch (e) { 
          console.error("OneSignal Błąd:", e); 
        }
      };
      
      runOneSignal();
    }
  }, []);

  return null;
}