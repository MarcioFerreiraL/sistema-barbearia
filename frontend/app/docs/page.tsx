"use client";

import { RedocStandalone } from "redoc";

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <RedocStandalone
        specUrl={`${process.env.NEXT_PUBLIC_API_DOCS}`}
        options={{
          nativeScrollbars: true,
          theme: {
            colors: { primary: { main: "#1f2937" } },
            typography: { fontFamily: "inherit" }
          }
        }}
      />
    </div>
  );
}