import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../(tabs)/HomeScreen';
import ControlScreen from '../(tabs)/ControlScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Status" component={HomeScreen} />
      <Tab.Screen name="Controle" component={ControlScreen} />
    </Tab.Navigator>
  );
}