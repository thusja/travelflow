import React from "react";
import coverImg from "@/assets/images/cover.png";

const Hero = () => {
  return (
    <div className="relative flex flex-col">
      {/* Background image */}
      <img
        src={coverImg}
        alt="cover"
        className="w-screen h-screen object-cover"
      />

      {/* Overlay text */}
      <div className="absolute top-0 left-0 w-screen h-screen flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-white font-extrabold text-[7vh] leading-[65px]">
          Your Imagination Is
        </h1>
        <h1 className="text-white font-extrabold text-[7vh] leading-[65px]">
          Your Only Limit
        </h1>
        <p className="text-white pt-[5vh] max-sm:pt-[2vh] text-base sm:text-lg">
          We always try to make our customer happy. We provide all kind of facilities.
        </p>
        <p className="text-white font-semibold leading-9 mt-2 text-base sm:text-lg">
          Your satisfaction is our main priority
        </p>
        <a
          href="/"
          className="mt-[4vh] max-sm:mt-[3vh] inline-block px-12 py-5 max-sm:py-2 max-sm:px-12 bg-emerald-600 text-white rounded hover:bg-emerald-400 transition duration-300"
        >
          Discover More
        </a>
      </div>

      {/* Bottom fade overlay */}
      <div className="absolute top-[91vh] w-screen h-[10vh] z-[1] bg-gradient-to-b from-transparent via-white/50 to-white" />
    </div>
  )
}

export default Hero;
