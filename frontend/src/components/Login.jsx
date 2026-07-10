import React, { useState } from "react";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { seedMockStudent } from "../mockAuth";
import {
  Building2, LogIn, UserPlus, Eye, EyeOff, Mail, Lock,
  User, Users, GraduationCap, ArrowRight, ShieldCheck
} from "lucide-react";

const MOCK_USERS = {
  male: {
    uid: "stud_alex_99",
    name: "Alex Ngozi",
    email: "alex.n@university.edu",
    role: "student",
    gender: "male",
    academicLevel: 400,
    isEligible: true,
    currentAllocationId: null
  },
  female: {
    uid: "stud_grace_88",
    name: "Grace Okonkwo",
    email: "grace.o@university.edu",
    role: "student",
    gender: "female",
    academicLevel: 300,
    isEligible: true,
    currentAllocationId: null
  }
};

export default function Login({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gender, setGender] = useState("male");
  const [academicLevel, setAcademicLevel] = useState(100);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleMockLogin = async (genderKey) => {
    setLoading(true);
    setError("");
    setIsConnecting(true);

    try {
      const user = MOCK_USERS[genderKey];
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        await setDoc(userRef, user);
      }

      await seedMockStudent();
      onLogin(user);
    } catch (err) {
      console.error("Mock login error:", err);
      const user = MOCK_USERS[genderKey];
      onLogin(user);
    } finally {
      setLoading(false);
      setIsConnecting(false);
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
          name,
          email,
          role: "student",
          gender,
          academicLevel: parseInt(academicLevel),
          isEligible: true,
          currentAllocationId: null
        });
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (userDoc.exists()) {
        onLogin(userDoc.data());
      } else {
        onLogin({
          uid: userCredential.user.uid,
          name: userCredential.user.displayName || email.split("@")[0],
          email,
          role: "student",
          gender: "male",
          academicLevel: 100,
          isEligible: true
        });
      }
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex">
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900 relative overflow-hidden items-center justify-center p-12">
        <div className="absolute top-20 -left-20 h-96 w-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -right-20 h-80 w-80 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="relative z-10 text-center max-w-md">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 mb-8">
            <Building2 className="h-10 w-10 text-indigo-400" />
          </div>
          <h1 className="text-4xl font-black text-white mb-4 tracking-tight">
            University Hostel<br />Allocation Portal
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Secure your on-campus accommodation with real-time room selection, instant booking confirmation, and digital allocation management.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-left">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <ShieldCheck className="h-6 w-6 text-emerald-400 mb-2" />
              <p className="text-xs text-slate-400 font-medium">Real-time Availability</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <ShieldCheck className="h-6 w-6 text-emerald-400 mb-2" />
              <p className="text-xs text-slate-400 font-medium">5-Min Booking Lock</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
              <ShieldCheck className="h-6 w-6 text-emerald-400 mb-2" />
              <p className="text-xs text-slate-400 font-medium">Instant Allocation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <Building2 className="h-8 w-8 text-indigo-400" />
            <span className="text-xl font-bold text-white">Hostel Portal</span>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                {isSignUp ? "Register to access hostel allocation" : "Sign in to your account"}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-sm font-medium text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleFirebaseAuth} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                      <User className="h-3 w-3 inline mr-1" /> Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      required
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        <Users className="h-3 w-3 inline mr-1" /> Gender
                      </label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        <GraduationCap className="h-3 w-3 inline mr-1" /> Level
                      </label>
                      <select
                        value={academicLevel}
                        onChange={(e) => setAcademicLevel(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                      >
                        {[100, 200, 300, 400, 500].map(l => (
                          <option key={l} value={l}>{l} Level</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  <Mail className="h-3 w-3 inline mr-1" /> Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  <Lock className="h-3 w-3 inline mr-1" /> Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold rounded-xl px-4 py-3 text-sm transition flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : isSignUp ? (
                  <><UserPlus className="h-4 w-4" /> Create Account</>
                ) : (
                  <><LogIn className="h-4 w-4" /> Sign In</>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
                className="text-sm text-indigo-400 hover:text-indigo-300 transition font-medium"
              >
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Register"}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/50">
              <p className="text-xs text-slate-500 text-center mb-4 font-medium uppercase tracking-wider">
                Quick Demo Access
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleMockLogin("male")}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-white transition disabled:opacity-50"
                >
                  <User className="h-4 w-4 text-indigo-400" />
                  Male Student
                </button>
                <button
                  onClick={() => handleMockLogin("female")}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-white transition disabled:opacity-50"
                >
                  <User className="h-4 w-4 text-pink-400" />
                  Female Student
                </button>
              </div>
            </div>

            {isConnecting && (
              <div className="mt-4 text-xs text-slate-500 text-center animate-pulse">
                Connecting to database...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
