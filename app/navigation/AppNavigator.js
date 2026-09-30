// app/navigation/AppNavigator.js
import React, { useEffect, useState, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import TenantDashboard from "../screens/TenantDashboard";
import OwnerDashboard from "../screens/OwnerDashboard";

import storage from "../utils/storage"; // your AsyncStorage wrapper

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // restore user session
  useEffect(() => {
    (async () => {
      try {
        const raw = await storage.getItem("user");
        if (raw) setUser(JSON.parse(raw));
      } catch (e) {
        console.warn("restore failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogin = useCallback((u) => {
    setUser(u);
  }, []);

  const handleLogout = useCallback(async () => {
    await storage.removeItem("accessToken");
    await storage.removeItem("refreshToken");
    await storage.removeItem("user");
    setUser(null);
  }, []);

  if (loading) {
    return null; // or splash screen / loader
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login">
            {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
          </Stack.Screen>
        ) : user.role === "tenant" ? (
          <Stack.Screen name="Tenant">
            {(props) => <TenantDashboard {...props} onLogout={handleLogout} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Owner">
            {(props) => <OwnerDashboard {...props} onLogout={handleLogout} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
