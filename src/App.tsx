import { useState } from 'react'
import MyLogInComponent from "./logInComponent.tsx";

export default function MyApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [walletAdress, setWalletAdress] = useState("")

  function hadleLogInResponse(isLoggedInResponse: boolean, walletAdressResponse: string) {
      setIsLoggedIn(isLoggedInResponse)
      setWalletAdress(walletAdressResponse)
  }

  let content;

  if (isLoggedIn) {
      content = <MyLogInComponent onLogin={hadleLogInResponse} />;
  } else {
      content = <LoginForm />;
  }
  return (
    <div>
        {content}
    </div>
  )
}
