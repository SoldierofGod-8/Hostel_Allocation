import React, { useState } from "react";
import HostelBooking from "./components/HostelBooking";
import Login from "./components/Login";

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <HostelBooking user={currentUser} onLogout={() => setCurrentUser(null)} />
    </div>
  );
}

export default App;
