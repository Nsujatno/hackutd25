import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function HomePage() {
  const { user, isLoaded } = useUser();
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:8000/users/${user.id}`);
        const data = await res.json();
        setUserInfo(data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    fetchData();
  }, [isLoaded, user]);

  if (!isLoaded) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Welcome, {user?.fullName}</h1>
      {userInfo ? (
        <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto text-sm">
          {JSON.stringify(userInfo, null, 2)}
        </pre>
      ) : (
        <p>Loading user info...</p>
      )}
    </div>
  );
}
