import compression from "compression";

const compressionConfig = compression({
  level: 6,
});

export default compressionConfig;
