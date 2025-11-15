import { useAuth } from "../context/AuthContext";

export const DebugAuth = () => {
  const { session, user, profile, loading } = useAuth();

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded-lg text-xs z-50">
      <div>Loading: {loading ? "true" : "false"}</div>
      <div>Session: {session ? "yes" : "no"}</div>
      <div>User: {user ? user.id : "none"}</div>
      <div>Profile: {profile ? "yes" : "no"}</div>
    </div>
  );
};
