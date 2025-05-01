import React from "react";
import FeatureCard from "../components/FeatureCard";
import StatCard from "../components/StatCard";
import HowItWorksCard from "../components/HowItWorksCard";
import CTACard from "../components/CTACard";
import ExtraCard from "../components/ExtraCard";
import ProjectInfoCard from "../components/ProjectInfoCard";
import Footer from "../components/Footer";

function Home({ user, userCount }) {
  return (
    <>
      <main className="flex flex-col items-center justify-center text-center mt-24 px-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          CS2Squad — Find and Build Your Perfect Team
        </h1>
        <p className="text-lg text-gray-300 mb-6 max-w-xl">
          A full-stack matchmaking platform for CS2 players. Match by rank, region, and playstyle — built with PostgreSQL, Express, React, and Node.
        </p>
        <div className="text-2xl font-mono text-green-400">
         🔍 Full-stack PERN project with Steam integration
        </div>
      </main>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-6 mt-16 max-w-7xl mx-auto">
        <FeatureCard />
        <StatCard />
        <HowItWorksCard />
        <ExtraCard />
        <ProjectInfoCard />
        <CTACard user={user} />
      </section>

      <Footer />
    </>
  );
}

export default Home;
