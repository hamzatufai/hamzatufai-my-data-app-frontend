import type { Metadata } from "next";
import type { ReactNode } from "react";
import WorkspaceArea from "@/components/WorkspaceArea";
import { BrandingProvider } from "@/lib/branding";
import "./globals.css";

export const metadata: Metadata = {
  title: "CleanCSV",
  description: "Profile, clean, validate and export datasets.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen p-4 lg:p-6">
        <BrandingProvider>
          <div className="mx-auto flex max-w-[1600px] gap-6">
            {/* The sidebar is rendered inside WorkspaceArea only for approved,
                signed-in users — signed-out visitors never see it. */}
            <WorkspaceArea>{children}</WorkspaceArea>
          </div>
        </BrandingProvider>
      </body>
    </html>
  );
}
