import { Redirect } from "expo-router";
import { useAuth } from "../context/auth-context.context";

export default function Index() {
  const { token } = useAuth();

  return <Redirect href={token ? "/home" : "/login"} />;
}
