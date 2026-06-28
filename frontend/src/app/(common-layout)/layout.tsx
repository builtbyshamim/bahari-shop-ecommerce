import Footer from "@/components/shared/footer/Footer";
import Toolbar from "@/components/shared/footer/Toolbar";
import Navbar from "@/components/shared/navbar/Navbar";
import FloatingCartButton from "@/components/shared/cart-modal/FloatingCartButton";
import { ReactNode } from "react";
interface CommonLayoutProps {
  children: ReactNode;
}

const CommonLayout = ({ children }: CommonLayoutProps) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <Toolbar />
      <FloatingCartButton />
    </>
  );
};

export default CommonLayout;
