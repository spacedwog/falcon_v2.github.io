import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../(tabs)/HomeScreen';
import ControlScreen from '../(tabs)/ControlScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="HomeScreen" component={HomeScreen} />
      <Tab.Screen name="ControlScreen" component={ControlScreen} />
    </Tab.Navigator>
  );
}