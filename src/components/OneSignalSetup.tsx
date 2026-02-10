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
            size: "medium",
            theme: "dark",
            position: "bottom-right",
            text: {
              "tip.state.unsubscribed": "Włącz powiadomienia o biegach!",
              "message.action.subscribed": "Super! Będziemy dawać znać o startach."
            }
          }
        });
      } catch (error) {
        console.error("OneSignal Error:", error);
      }
    }
  }, []);
  return null;
}
