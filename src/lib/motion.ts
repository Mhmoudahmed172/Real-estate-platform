export const pageMotion = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const },
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

export const fadeItem = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
};

export const cardHover = {
  whileHover: { y: -3 },
  transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
};
