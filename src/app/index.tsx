import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>HOME.</Text>
      <Link href={{ pathname: "/(pages)/login" }}>Go to Login Page</Link>
    </View>
  );
}
