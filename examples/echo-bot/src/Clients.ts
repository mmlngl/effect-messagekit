import * as Line from "@mmlngl/effect-messagekit-provider-line";
import * as Layer from "effect/Layer";

const lineClientLayer = Line.Client.LineClient.layer.pipe(
  Layer.provide(Line.Config.LineConfig.layerFromEnv),
);

export const clientsLayer = Layer.mergeAll(lineClientLayer);
