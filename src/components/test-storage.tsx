"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  createDefaultUserProfile,
  createDefaultGameModeData
} from "@/lib/storage";
import { useAppContext } from "@/lib/context";

export function TestStorage() {
  const { userProfile, setUserProfile, pvpData, setPvpData } = useAppContext();

  const [testResults, setTestResults] = useState<string[]>([]);

  const runTests = () => {
    const results: string[] = [];

    // Test 1: User Profile
    results.push("✅ User Profile loaded successfully");
    results.push(`   - ID: ${userProfile.id}`);
    results.push(`   - Name: ${userProfile.name}`);
    results.push(`   - Current Mode: ${userProfile.currentGameMode}`);

    // Test 2: Game Mode Data
    results.push("✅ PvP Data loaded successfully");
    results.push(`   - Tasks: ${pvpData.tasks.length}`);
    results.push(`   - Hideout Modules: ${pvpData.hideoutModules.length}`);
    results.push(`   - Required Items: ${pvpData.requiredItems.length}`);

    // Test 3: Update user profile
    const updatedProfile = {
      ...userProfile,
      name: "Test Player",
      currentGameMode: "pvp" as const,
      lastUpdated: new Date()
    };
    setUserProfile(updatedProfile);
    results.push("✅ User Profile updated successfully");

    // Test 4: Add test data to PvP
    const updatedPvpData = {
      ...pvpData,
      tasks: [
        {
          id: "test-task-1",
          name: "Test Task",
          trader: "Prapor",
          objectives: [
            {
              id: "obj-1",
              description: "Test objective",
              type: "kill" as const,
              completed: false
            }
          ],
          status: "available" as const,
          requiredItems: [],
          prerequisites: [],
          rewards: [],
          level: 1
        }
      ],
      lastUpdated: new Date()
    };
    setPvpData(updatedPvpData);
    results.push("✅ PvP Data updated with test task");

    // Test 5: Direct localStorage operations
    const testKey = "test-storage-key";
    const testData = { message: "Hello from localStorage!", timestamp: new Date() };
    saveToLocalStorage(testKey, testData);
    const loadedData = loadFromLocalStorage<typeof testData>(testKey);
    
    if (loadedData && loadedData.message === testData.message) {
      results.push("✅ Direct localStorage save/load working");
    } else {
      results.push("❌ Direct localStorage save/load failed");
    }

    setTestResults(results);
  };

  const clearData = () => {
    setUserProfile(createDefaultUserProfile());
    setPvpData(createDefaultGameModeData());
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-4xl glass tactical-panel weathered">
      <CardHeader>
        <CardTitle className="text-tarkov-orange">Storage System Test</CardTitle>
        <CardDescription className="text-muted-foreground">
          Test the core data structures and local storage implementation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runTests} className="btn-tactical glow-orange">Run Tests</Button>
          <Button variant="outline" onClick={clearData} className="btn-tactical border-tarkov text-muted-foreground hover:text-tarkov-orange">Clear Data</Button>
        </div>
        
        {testResults.length > 0 && (
          <div className="bg-tarkov-panel p-4 rounded-lg border border-tarkov animate-fade-in">
            <h3 className="font-semibold mb-2 text-tarkov-orange">Test Results:</h3>
            <div className="space-y-1 font-mono text-sm">
              {testResults.map((result, index) => (
                <div key={index} className={result.startsWith('✅') ? 'text-success' : result.startsWith('❌') ? 'text-destructive' : 'text-muted-foreground'}>
                  {result}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-tarkov-panel p-3 rounded border border-tarkov glass animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <h4 className="font-semibold mb-2 text-tarkov-orange">Current User Profile</h4>
            <div className="text-sm space-y-1 text-foreground">
              <div>Name: <span className="text-tarkov-orange">{userProfile.name}</span></div>
              <div>Mode: <span className="text-success">{userProfile.currentGameMode}</span></div>
              <div>Theme: <span className="text-info">{userProfile.preferences.theme}</span></div>
            </div>
          </div>
          
          <div className="bg-tarkov-panel p-3 rounded border border-tarkov glass animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <h4 className="font-semibold mb-2 text-tarkov-orange">PvP Data</h4>
            <div className="text-sm space-y-1 text-foreground">
              <div>Tasks: <span className="text-warning">{pvpData.tasks.length}</span></div>
              <div>Hideout Modules: <span className="text-info">{pvpData.hideoutModules.length}</span></div>
              <div>Required Items: <span className="text-success">{pvpData.requiredItems.length}</span></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}