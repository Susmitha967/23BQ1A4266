"use client";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import React from "react";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#6C63FF" },
    secondary: { main: "#FF6584" },
    background: { default: "#0D0D1A", paper: "#13132B" },
    success: { main: "#00E5A0" },
    warning: { main: "#FFB547" },
    error: { main: "#FF4D6D" },
    text: { primary: "#E8E8FF", secondary: "#8888BB" },
  },
  typography: {
    fontFamily: '"DM Sans", "Segoe UI", sans-serif',
    h4: { fontWeight: 700, letterSpacing: "-0.5px" },
    h6: { fontWeight: 600 },
    body2: { fontSize: "0.82rem" },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(108, 99, 255, 0.15)",
          transition: "all 0.2s ease",
          "&:hover": {
            borderColor: "rgba(108, 99, 255, 0.4)",
            transform: "translateY(-1px)",
            boxShadow: "0 8px 32px rgba(108,99,255,0.12)",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, fontSize: "0.72rem", letterSpacing: "0.3px" },
      },
    },
  },
});

export default function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
