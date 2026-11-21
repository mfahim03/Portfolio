import "./globals.css";

export const metadata = {
  title: "Muhammad Fahim",
  description: "Muhammad Fahim is a software engineering graduate focused on full-stack development, mobile applications and database systems.",
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
