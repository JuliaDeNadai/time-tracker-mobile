import TabBar from '@/components/tab-bar';
import Colors from '@/constants/colors';
import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={props => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: Colors.background },
      }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="records" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
