import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/directory/:path*",
    "/marketplace/:path*",
    "/studio/:path*",
    "/admin/:path*"
  ],
};
