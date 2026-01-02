import "../../styles/global.css";
import { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "RenderKit Video Editor",
  description: "RenderKit Video Editor",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-3  border-b border-unfocused-border-color">
      {/* Left Section - Logo and Branding */}
      <div className="flex items-center gap-3">
        {/* Logo - Three overlapping circles */}
        <div className="relative w-10 h-10 flex-shrink-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-blue-400"></div>
          <div className="absolute bottom-0 left-0 w-5 h-5 rounded-full bg-orange-500"></div>
          <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-red-500"></div>
        </div>
        <div className="flex flex-col">
          <span className="text-white font-semibold text-sm"> RenderKit </span>
          <span className="text-gray-400 text-xs">Video Editor</span>
        </div>
      </div>

     
      {/* Center Section - Project Path */}
      <div className="flex-1 flex items-center justify-center">
        <button className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors">
          <span className="text-sm">Projects / Youtube_post04.tn</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 8L2 4h8L6 8z" />
          </svg>
        </button>
      </div>

      {/* Right Section - Settings, Users, Export */}
      <div className="flex items-center gap-3">
        {/* Settings Icon */}
        <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 hover:text-gray-200 hover:bg-gray-600 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 4.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM5.5 8a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0z" />
            <path d="M8 0a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-1 0V.5A.5.5 0 0 1 8 0zM8 13a.5.5 0 0 1 .5.5v1.5a.5.5 0 0 1-1 0v-1.5A.5.5 0 0 1 8 13zM.5 8a.5.5 0 0 1 .5-.5h1.5a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5zM13 7.5a.5.5 0 0 1 1 0v1.5a.5.5 0 0 1-1 0V7.5zM11.314 1.9a.5.5 0 0 1 .707 0l1.06 1.06a.5.5 0 0 1 0 .707l-1.06 1.06a.5.5 0 0 1-.707-.707l1.06-1.06-1.06-1.06zM2.686 11.314a.5.5 0 0 1 .707 0l1.06 1.06a.5.5 0 0 1 0 .707l-1.06 1.06a.5.5 0 0 1-.707-.707l1.06-1.06-1.06-1.06zM11.314 11.314a.5.5 0 0 1 0-.707l1.06-1.06a.5.5 0 0 1 .707.707l-1.06 1.06a.5.5 0 0 1-.707 0zM2.686 1.9a.5.5 0 0 1 0-.707l1.06-1.06a.5.5 0 0 1 .707.707L3.393 1.9a.5.5 0 0 1-.707 0z" />
          </svg>
        </button>
      
        {/* Export Button */}
        <button className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 2a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 8.293V2.5A.5.5 0 0 1 8 2z" />
            <path d="M2 10a.5.5 0 0 1 .5.5v3a.5.5 0 0 0 .5.5h10a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 1 1 0v3A1.5 1.5 0 0 1 13 15H3A1.5 1.5 0 0 1 1.5 13.5v-3A.5.5 0 0 1 2 10z" />
          </svg>
          <span>Export</span>
        </button>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full overflow-hidden">
      <body className="bg-[#2D232E] h-full overflow-hidden flex flex-col p-10">
        <Header />
        <main className="flex-1 overflow-hidden">{children}</main>
      </body>
    </html>
  );
}
