import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { CommandMenu } from "@/components/CommandMenu";

export const metadata: Metadata = {
  title: {
    default: "Laboratorio Digital - Tabancura",
    template: "%s - Laboratorio Digital Tabancura"
  },
  description: "Gestión interna de Policlínico Tabancura",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-background text-foreground flex h-screen overflow-hidden antialiased selection:bg-primary/30">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-background/50 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
            <div className="p-8 max-w-[1600px] mx-auto w-full px-4 md:px-12 relative z-10">
              {children}
            </div>
          </main>
          <CommandMenu />
        </ThemeProvider>
      </body>
    </html>
  );
}
