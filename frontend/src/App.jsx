import React, { useState } from "react";
import LoginPage from "./components/auth/LoginPage";
import AppLayout from "./components/layout/AppLayout";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

  return (
    <AppLayout
      student={currentUser}
      onLogout={() => setCurrentUser(null)}
    />
  );
}

export default App;
