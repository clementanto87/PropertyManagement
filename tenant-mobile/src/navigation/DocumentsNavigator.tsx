import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DocumentsScreen } from '../screens/DocumentsScreen';
import { UploadDocumentScreen } from '../screens/UploadDocumentScreen';

const Stack = createNativeStackNavigator();

export const DocumentsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DocumentsList" component={DocumentsScreen} />
      <Stack.Screen name="UploadDocument" component={UploadDocumentScreen} />
    </Stack.Navigator>
  );
};

