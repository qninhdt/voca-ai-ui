import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("welcome", "routes/welcome.tsx"),
  route("ai-chat", "routes/ai-chat.tsx"),
  route("collection", "routes/collection.tsx"),
  route("deck/:id", "routes/deck.tsx"),
  route("edit-deck/:id", "routes/edit-deck.tsx"),
  route("edit-folder/:id", "routes/edit-folder.tsx"),
  route("create-deck", "routes/create-deck.tsx"),
  route("create-folder", "routes/create-folder.tsx"),
  route("learn/:id", "routes/learn.tsx"),
  route("profile", "routes/profile.tsx"),
  route("quiz/:id", "routes/quiz.tsx"),
  route("dictionary", "routes/dictionary.tsx"),
  route("dictionary/:word", "routes/word-definition.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
] satisfies RouteConfig;
