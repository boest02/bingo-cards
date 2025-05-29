

import "./globals.css";

export const metadata = {
  title: 'Bingo Card Generator',
  description: 'Create custom bingo cards for school-age children.',
};

import { ReactNode, Suspense } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense>{children}</Suspense>        
      </body>
    </html>
  );
}

