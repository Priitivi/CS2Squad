import React from "react";
import { Navigate } from "react-router-dom";
import FeatureCard from "../components/FeatureCard";
import StatCard from "../components/StatCard";
import HowItWorksCard from "../components/HowItWorksCard";
import CTACard from "../components/CTACard";
import ExtraCard from "../components/ExtraCard";
import TestimonialCard from "../components/TestimonialCard";

function Home({ user, userCount }) {
  if (user) return <Navigate to="/profile" />;

  return (
    <>
      <main className="flex flex-col items-center justify-center text-center mt-24 px-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Find your perfect CS2 teammates
        </h1>
        <p className="text-lg text-gray-300 mb-6 max-w-xl">
          Match by rank, region, and playstyle. No more solo queues, just good vibes.
        </p>
        <div className="text-2xl font-mono text-green-400">
          🔄 {userCount.toLocaleString()} players connected
        </div>
      </main>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-6 mt-16 max-w-7xl mx-auto">
        <FeatureCard />
        <StatCard />
        <HowItWorksCard />
        <ExtraCard />
        <TestimonialCard />
        <CTACard />
      </section>
    </>
  );
}

export default Home;
