import { motion } from "motion/react";

export function MarsLogo() {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-black overflow-hidden group">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-tr from-orange-500 via-red-500 to-purple-600 opacity-80"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="relative z-10 font-black text-white text-sm tracking-tighter">
          M
        </div>
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-xl tracking-widest text-gray-900 leading-none">
          MARS
        </span>
        <span className="text-[0.6rem] tracking-[0.2em] text-gray-400 font-medium uppercase mt-0.5">
          Collection
        </span>
      </div>
    </div>
  );
}
