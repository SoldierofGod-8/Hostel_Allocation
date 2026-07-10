import React, { useState } from "react";
import LoginPage from "./components/auth/LoginPage";
import AppLayout from "./components/layout/AppLayout";
import BookingDashboard from "./components/booking/BookingDashboard";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  if (!currentUser) {
    return <LoginPage onLogin={setCurrentUser} />;
  }

  return (
    <AppLayout
      student={currentUser}
      onLogout={() => setCurrentUser(null)}
    >
      <BookingDashboard user={currentUser} />
    </AppLayout>
  );
}

export default App;
