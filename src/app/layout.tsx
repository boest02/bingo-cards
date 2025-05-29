

import "./globals.css";

export const metadata = {
  title: 'Bingo Card Generator',
  description: 'Create custom bingo cards for school-age children.',
};

import { ReactNode } from "react";
/* Import Google Font - Inter (moved to globals.css) */

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

