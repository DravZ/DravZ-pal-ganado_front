import { Outlet } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import StatusBar from "../../components/shared/StatusBar/StatusBar";

export default function SuperLayout() {
    return (
        <div className="col-12 mx-0 py-0">
            <StatusBar/>
            <Navbar />
            <Outlet />
            <Footer />
        </div>
    );
}