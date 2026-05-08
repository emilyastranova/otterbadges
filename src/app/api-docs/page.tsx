import SwaggerUIClient from "./SwaggerUIClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `API Documentation | ${process.env.NEXT_PUBLIC_APP_NAME || "OtterBadges"}`,
  description: `Swagger API documentation for ${process.env.NEXT_PUBLIC_APP_NAME || "OtterBadges"}`,
};

export default function ApiDocsPage() {
  return <SwaggerUIClient />;
}
