// Bun test configuration
const config = {
  test: {
    preload: ["./src/test-setup.ts"],
    root: "./src",
    timeout: 10000,
  },
};

export default config;
