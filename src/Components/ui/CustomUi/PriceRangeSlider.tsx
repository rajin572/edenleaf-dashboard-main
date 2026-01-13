"use client";
import React, { useState, useEffect, useRef } from "react";

const PriceRangeSlider: React.FC = () => {
  const [minPrice, setMinPrice] = useState<number>(2500);
  const [maxPrice, setMaxPrice] = useState<number>(8500);
  const priceGap: number = 500;
  const rangeMin: number = 0;
  const rangeMax: number = 10000;

  const progressRef = useRef<HTMLDivElement>(null);
  const minTagRef = useRef<HTMLDivElement>(null);
  const maxTagRef = useRef<HTMLDivElement>(null);

  // Update slider progress bar and price tag positions
  useEffect(() => {
    if (progressRef.current) {
      const minPercent = (minPrice / rangeMax) * 100;
      const maxPercent = 100 - (maxPrice / rangeMax) * 100;

      progressRef.current.style.left = `${minPercent}%`;
      progressRef.current.style.right = `${maxPercent}%`;

      // Position the min and max price tags based on their respective percent values
      if (minTagRef.current) {
        minTagRef.current.style.left = `calc(${minPercent}% - 20px)`; // Adjust to center tag
      }

      if (maxTagRef.current) {
        maxTagRef.current.style.right = `calc(${maxPercent}% - 20px)`; // Adjust to center tag
      }
    }
  }, [minPrice, maxPrice]);

  // Handle range slider changes
  const handleRangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    const isMin = e.target.name === "minRange";

    if (isMin) {
      if (value > maxPrice - priceGap) {
        setMinPrice(maxPrice - priceGap);
      } else {
        setMinPrice(value);
      }
    } else {
      if (value < minPrice + priceGap) {
        setMaxPrice(minPrice + priceGap);
      } else {
        setMaxPrice(value);
      }
    }
  };

  return (
    <div className="w-[90%] mx-auto mt-5">
      <div className="relative">
        <div className="h-1.5 bg-gray-400 rounded-full">
          <div
            ref={progressRef}
            className="absolute h-full bg-[#30599D] rounded-full"
          ></div>
        </div>

        <div className="relative">
          {/* Price Tag for Min */}
          <div
            ref={minTagRef}
            className="absolute top-[-25px] text-primary-color bg-secondary-color rounded-3xl text-sm px-2 py-1 -mt-5 font-semibold"
          >
            ${minPrice}
          </div>

          {/* Price Tag for Max */}
          <div
            ref={maxTagRef}
            className="absolute top-[-25px] text-primary-color bg-secondary-color rounded-3xl text-sm px-2 py-1 -mt-5 font-semibold"
          >
            ${maxPrice}
          </div>

          <input
            type="range"
            name="minRange"
            min={rangeMin}
            max={rangeMax}
            value={minPrice}
            onChange={handleRangeInput}
            className="absolute w-full h-1.5 top-[-6px] bg-transparent pointer-events-none appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#273D62] [&::-webkit-slider-thumb]:pointer-events-auto"
          />
          <input
            type="range"
            name="maxRange"
            min={rangeMin}
            max={rangeMax}
            value={maxPrice}
            onChange={handleRangeInput}
            className="absolute w-full h-1.5 top-[-6px] bg-transparent pointer-events-none appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#273D62] [&::-webkit-slider-thumb]:pointer-events-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default PriceRangeSlider;
