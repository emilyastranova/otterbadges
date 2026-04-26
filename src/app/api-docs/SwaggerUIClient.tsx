"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";
import spec from "../../../public/swagger.json";

const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function SwaggerUIClient() {
  return (
    <div style={{ backgroundColor: "white", minHeight: "100vh", padding: "20px" }}>
      <SwaggerUI spec={spec} />
    </div>
  );
}
