import SwaggerUIClient from "./SwaggerUIClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation | OtterBadges",
  description: "Swagger API documentation for OtterBadges",
};

export default function ApiDocsPage() {
  return <SwaggerUIClient />;
}
