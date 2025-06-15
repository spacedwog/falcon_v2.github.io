import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../../screens/HomeScreen';
import ControlScreen from '../../screens/ControlScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Status" component={HomeScreen} />
      <Tab.Screen name="Controle" component={ControlScreen} />
    </Tab.Navigator>
  );
}