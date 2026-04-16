import MyLogInComponent from "./logInComponent.tsx";
import {useAccount} from "wagmi";
import DashboardComponent from "./dashboardcomponent.tsx";

export default function MyApp() {
    const { isConnected} = useAccount()

  let content;

  if (isConnected) {
      content = <MyLogInComponent/>;
  } else {
      content = <DashboardComponent />;
  }
  return (
    <div>
        {content}
    </div>
  )
}
