// src/components/TestimonialCard.jsx
import React, { useEffect, useState } from "react";

const testimonials = [
  { quote: "I met my best teammates here. 10/10 app.", user: "— niko_wannabe, EU" },
  { quote: "Finally escaped solo queue hell 🔥", user: "— bomb_has_been_planted, NA" },
  { quote: "Way better than LFG Discords!", user: "— clutch_or_kick, SEA" },
];

function TestimonialCard() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white/5 p-8 min-h-[220px] rounded-2xl shadow hover:shadow-lg transition">
      <h3 className="text-xl font-semibold mb-4 text-yellow-300">⭐ Testimonials</h3>
      <blockquote className="text-gray-300 italic text-sm">
        ❝ {testimonials[index].quote} ❞
        <span className="block mt-2 text-xs text-gray-500">{testimonials[index].user}</span>
      </blockquote>
    </div>
  );
}

export default TestimonialCard;
