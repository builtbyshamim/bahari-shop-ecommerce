import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function ProtectedRoute({ children }:any) {
    const authToken = Cookies.get('access_token') ||"dd";
    if (!authToken) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
