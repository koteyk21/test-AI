import { useEffect } from "react";
import { useLocation } from "wouter";

const Home = () => {
  const [, navigate] = useLocation();

  // Redirect to feed automatically
  useEffect(() => {
    navigate("/feed");
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-full">
      <p>Redirecting to feed...</p>
    </div>
  );
};

export default Home;
