import { ReactNode } from "react";
import Footer from "./components/footer";
export default function Layout({ children }: { children: ReactNode }) {
    return (
        <div>
            <main>
            {children}
            </main>
            <Footer/>
        </div>
    )
}