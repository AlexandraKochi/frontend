"use client"; // <--- ESTO ES VITAL
import "./globals.css";
import { PrivyProvider } from "@privy-io/react-auth";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <PrivyProvider
          appId="cmoyow017001r0cjjjr83bdah"
          config={{
            appearance: { theme: 'dark' },
            loginMethods: ['email', 'google', 'wallet'],
            embeddedWallets: {
              solana: {
                createOnLogin: 'users-without-wallets',
              },
            },
          }}
        >
          {children}
        </PrivyProvider>
      </body>
    </html>
  );
}