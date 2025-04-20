import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("ai-chat", "routes/ai-chat.tsx"),
  route("collection", "routes/collection.tsx"),
  route("deck/:id", "routes/deck.tsx"),
  route("learn/:id", "routes/learn.tsx"),
  route("profile", "routes/profile.tsx"),
  route("quiz/:id", "routes/quiz.tsx"),
] satisfies RouteConfig;
