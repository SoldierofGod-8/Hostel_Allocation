import React, { useState } from "react";
import { auth, db } from "../../firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { LogIn, UserPlus, ShieldCheck, Building2 } from "lucide-react";

const DEMO_USERS = {
  male: {
    uid: "stud_alex_99",
    name: "Alex Ngozi",
    email: "alex.n@university.edu",
    role: "student",
    gender: "male",
    academicLevel: 400,
    isEligible: true,
    currentAllocationId: null,
  },
  female: {
    uid: "stud_grace_88",
    name: "Grace Okonkwo",
    email: "grace.o@university.edu",
    role: "student",
    gender: "female",
    academicLevel: 300,
    isEligible: true,
    currentAllocationId: null,
  },
};

export default function LoginPage({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [academicLevel, setAcademicLevel] = useState(100);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMockLogin = async (genderKey) => {
    setLoading(true);
    setError("");
    try {
      const user = DEMO_USERS[genderKey];
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) await setDoc(userRef, user);
      onLogin(user);
    } catch {
      onLogin(DEMO_USERS[genderKey]);
    } finally {
      setLoading(false);
    }
  };

  const handleFirebaseAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      let userCredential;
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          uid: userCredential.user.uid,
          name, email, role: "student", gender,
          academicLevel: parseInt(academicLevel),
          isEligible: true, currentAllocationId: null,
        });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      onLogin(userDoc.exists() ? userDoc.data() : { uid: userCredential.user.uid, name: email.split("@")[0], email, role: "student", gender: "male", academicLevel: 100, isEligible: true });
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const LoginForm = ({ genderKey, title }) => (
    <div className="flex-1 bg-surface-container-lowest border border-border-neutral rounded-lg p-8 flex flex-col transition-all duration-300 split-hover relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Building2 className="h-32 w-32 text-primary" />
      </div>
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center shrink-0">
          <span className="text-on-primary font-headline-md font-bold text-lg">
            {genderKey === "male" ? "M" : "F"}
          </span>
        </div>
        <div>
          <h3 className="font-headline-md text-headline-md text-primary">{title}</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">Student Login</p>
        </div>
      </div>
      <form className="flex flex-col gap-5 relative z-10 mt-auto" onSubmit={(e) => { e.preventDefault(); handleMockLogin(genderKey); }}>
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-primary text-on-primary font-title-md text-title-md rounded hover:bg-primary-container transition-colors flex items-center justify-center gap-2"
        >
          <LogIn className="h-5 w-5" />
          Login as {title}
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md antialiased overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-[0.03] bg-primary pointer-events-none" />
      <div className="relative z-10 flex flex-col h-full min-h-screen w-full max-w-container-max mx-auto px-base md:px-gutter">
        <header className="flex flex-col items-center justify-center py-8 md:py-12 shrink-0">
          <img src="logo.png" alt="ADUN Logo" className="h-16 w-16 object-contain mb-4" />
          <h1 className="font-display-lg text-display-lg text-primary text-center mb-2">
            Admiralty University of Nigeria
          </h1>
          <p className="font-title-md text-title-md text-primary-container text-center tracking-wide uppercase opacity-90">
            Excellence in Education
          </p>
          <div className="h-1 w-24 bg-secondary-container mt-6 rounded-full" />
          <h2 className="font-headline-md text-headline-md text-on-surface-variant text-center mt-6">
            Hostel Management Portal
          </h2>
        </header>

        <main className="flex-1 flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-12 pb-12 w-full max-w-5xl mx-auto">
          <LoginForm genderKey="male" title="Male Hostel" />
          <div className="hidden md:flex flex-col items-center justify-center shrink-0">
            <div className="w-px h-full bg-border-neutral relative flex flex-col justify-center items-center">
              <span className="bg-surface px-2 py-4 font-label-sm text-label-sm text-outline absolute tracking-widest" style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}>
                OR
              </span>
            </div>
          </div>
          <div className="md:hidden w-full h-px bg-border-neutral relative flex justify-center items-center my-4">
            <span className="bg-surface px-4 py-2 font-label-sm text-label-sm text-outline absolute tracking-widest">OR</span>
          </div>
          <LoginForm genderKey="female" title="Female Hostel" />
        </main>

        <div className="max-w-md mx-auto w-full pb-8">
          <div className="bg-surface-container-lowest border border-border-neutral rounded-lg p-6">
            <p className="text-center text-sm text-on-surface-variant mb-4 font-medium">Admin / Email Login</p>
            <form onSubmit={handleFirebaseAuth} className="space-y-3">
              {isSignUp && (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="w-full h-11 px-4 border border-border-neutral rounded bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-colors font-body-md text-body-md"
                />
              )}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full h-11 px-4 border border-border-neutral rounded bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-colors font-body-md text-body-md"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full h-11 px-4 border border-border-neutral rounded bg-surface-bright focus:border-primary focus:ring-2 focus:ring-primary focus:outline-none transition-colors font-body-md text-body-md"
              />
              {error && <p className="text-error text-sm font-medium">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 h-11 bg-primary text-on-primary font-title-md text-title-md rounded hover:bg-primary-container transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isSignUp ? (
                    <><UserPlus className="h-4 w-4" /> Register</>
                  ) : (
                    <><LogIn className="h-4 w-4" /> Sign In</>
                  )}
                </button>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(true); setError(""); }}
                    className="h-11 px-4 bg-surface-container text-on-surface font-body-md rounded hover:bg-surface-container-high transition-colors border border-border-neutral"
                  >
                    Sign Up
                  </button>
                )}
                {isSignUp && (
                  <button
                    type="button"
                    onClick={() => { setIsSignUp(false); setError(""); }}
                    className="h-11 px-4 bg-surface-container text-on-surface font-body-md rounded hover:bg-surface-container-high transition-colors border border-border-neutral"
                  >
                    Back
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <footer className="py-6 text-center shrink-0">
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            Secure Portal Access &copy; 2026 Admiralty University of Nigeria.
            For assistance, contact the <a className="text-primary hover:underline" href="#">Help Desk</a>.
          </p>
        </footer>
      </div>
    </div>
  );
}
