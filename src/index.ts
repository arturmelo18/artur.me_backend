import { Elysia } from "elysia";
import { SpotifyConnector } from "./connectors/spotifyConnector";

const spotifyConnector = new SpotifyConnector()

const currentlyPlayingTrack = async () => await spotifyConnector.getCurrentlyPlayingTrack()

const app = new Elysia()
.get("/", () => "Hello Elysia")
.get("/currentlyPlayingTrack", currentlyPlayingTrack)
.listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
