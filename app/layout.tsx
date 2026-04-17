import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "TableCRM Mobile Order",
  description: "Мобильная форма создания заказа для TableCRM"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        {children}
        <Toaster
          expand={false}
          position="top-center"
          richColors
          toastOptions={{
            className: "font-sans",
            duration: 4000
          }}
        />
      </body>
    </html>
  );
}
