import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './screens/HomeScreen';
import ControlScreen from './screens/ControlScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Status" component={HomeScreen} />
        <Tab.Screen name="Controle" component={ControlScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}