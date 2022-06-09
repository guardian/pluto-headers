import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import postcss from "rollup-plugin-postcss";
import packageJson from "./package.json";
import external from "rollup-plugin-peer-deps-external";
import svgr from "@svgr/rollup";
import image from "@rollup/plugin-image";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      external({includeDependencies: true}),
      nodeResolve(),
      commonjs(),
      typescript({ useTsconfigDeclarationDir: true }),
      postcss(),
      image({ exclude: /\.(svg)$/ }),
      svgr(),
    ],
  },
];
