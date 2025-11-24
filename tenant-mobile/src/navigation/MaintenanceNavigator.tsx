import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaintenanceScreen } from '../screens/MaintenanceScreen';
import { NewRequestScreen } from '../screens/NewRequestScreen';

const Stack = createNativeStackNavigator();

export const MaintenanceNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MaintenanceList" component={MaintenanceScreen} />
      <Stack.Screen name="NewRequest" component={NewRequestScreen} />
    </Stack.Navigator>
  );
};

