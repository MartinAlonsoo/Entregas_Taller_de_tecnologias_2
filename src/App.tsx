import MyLogInComponent from "./logInComponent.tsx";
import { useAccount } from "wagmi";
import DashboardComponent from "./dashboardcomponent.tsx";

export default function MyApp() {
    const { isConnected } = useAccount();

    return (
        <div>
            <MyLogInComponent />
            {isConnected ? <DashboardComponent /> : null}
        </div>
    );
}
