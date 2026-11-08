import { Elysia } from "elysia";
import { SpotifyConnector } from "./connectors/spotifyConnector";

const spotifyConnector = new SpotifyConnector()

const getCurrentSoundtrack = async () => await spotifyConnector.getCurrentlyPlayingTrack()

const app = new Elysia()
.get("/", () => "Hello Elysia")
.get("/currentMusic", getCurrentSoundtrack)
.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
