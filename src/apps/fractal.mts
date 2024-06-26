import { createRenderer } from "../index.mjs";
import fractalCompute from "./fractal.wgsl?raw";
import { fiboGridN } from "../math.mjs";

export let loadRenderer = async (canvas: HTMLCanvasElement) => {
  let seedSize = 4110000;

  let renderFrame = await createRenderer(
    canvas,
    {
      seedSize,
      seedData: makeSeed(seedSize),
      getParams: (dt) => [
        dt * 0.04, // deltaT
        0.06, // height
        0.004, // width
        0.99, // opacity
      ],
      computeShader: fractalCompute,
    },
    {
      vertexCount: 1,
      vertexData: [0, 1, 2, 3],
      indexData: [0, 1, 2, 1, 2, 3],
      vertexBufferLayout: vertexBufferLayout,
      // topology: "line-list",
      bgColor: [0.1, 0.0, 0.2, 1.0],
    }
  );

  return renderFrame;
};

function makeSeed(numParticles: number): Float32Array {
  const buf = new Float32Array(numParticles * 4);

  let scale = 0.2;

  for (let i = 0; i < numParticles; ++i) {
    let b = 4 * i;
    let [x, y, z] = fiboGridN(i + 1, numParticles);
    buf[b + 0] = x * scale;
    buf[b + 1] = y * scale;
    buf[b + 2] = z * scale;
    buf[b + 3] = 0.001;
  }

  return buf;
}

let vertexBufferLayout: GPUVertexBufferLayout[] = [
  {
    // instanced particles buffer
    arrayStride: 4 * 4,
    stepMode: "instance",
    attributes: [
      { shaderLocation: 0, offset: 0, format: "float32x3" },
      { shaderLocation: 1, offset: 4 * 3, format: "float32" },
    ],
  },
  {
    // vertex buffer
    arrayStride: 1 * 4,
    stepMode: "vertex",
    attributes: [{ shaderLocation: 2, offset: 0, format: "uint32" }],
  },
];
