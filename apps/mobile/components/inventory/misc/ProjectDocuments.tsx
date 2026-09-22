import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Linking } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { authClient } from '../../../lib/auth-client';

export function ProjectDocuments({ projectId, towers }: { projectId: string; towers: any[] }) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTowerId, setSelectedTowerId] = useState("");

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const baseURL = process.env.EXPO_PUBLIC_API_URL as string;
      const res = await authClient.$fetch(`/api/inventory/projects/${projectId}/documents${selectedTowerId ? `?towerId=${selectedTowerId}` : ''}`, { baseURL });
      if (res.data) {
        setDocuments(res.data as any[]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, [projectId, selectedTowerId]);

  const handleShareWhatsApp = async (doc: any) => {
    const text = `Hello! Please find the requested document here: ${doc.title}\n\nLink: ${doc.fileUrl}`;
    const url = `whatsapp://send?text=${encodeURIComponent(text)}`;

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Toast.show({ type: 'info', text1: 'WhatsApp Not Available', text2: 'WhatsApp is not installed on your device.' });
      }
    } catch (error) {
      console.error(error);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Error opening WhatsApp.' });
    }
  };

  return (
    <View className="flex-1 bg-slate-50 p-4">
      <View className="bg-white border border-slate-300 rounded-xl overflow-hidden mb-4">
        <Picker
          selectedValue={selectedTowerId}
          onValueChange={setSelectedTowerId}
          style={{ height: 50 }}
        >
          <Picker.Item label="All Documents (Project Level)" value="" />
          {towers.map((t: any) => (
            <Picker.Item key={t.id} label={`${t.name} Documents`} value={t.id} />
          ))}
        </Picker>
      </View>

      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : documents.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Feather name="file-text" size={48} color="#cbd5e1" />
          <Text className="text-slate-500 font-bold mt-4">No documents available.</Text>
        </View>
      ) : (
        <ScrollView className="flex-1">
          {documents.map((doc: any) => (
            <View key={doc.id} className="bg-white p-4 rounded-xl border border-slate-200 mb-3 shadow-sm flex-row items-center">
              <View className="p-3 bg-indigo-50 rounded-lg mr-4">
                <Feather name="file" size={24} color="#4f46e5" />
              </View>
              <View className="flex-1">
                <Text className="font-bold text-slate-900" numberOfLines={1}>{doc.title}</Text>
                <Text className="text-xs text-slate-500 font-bold uppercase mt-1">{doc.category.replace('_', ' ')}</Text>
              </View>

              <View className="flex-row gap-2 ml-2">
                <TouchableOpacity
                  onPress={() => Linking.openURL(doc.fileUrl)}
                  className="p-2 bg-slate-100 rounded-full"
                >
                  <Feather name="external-link" size={18} color="#475569" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleShareWhatsApp(doc)}
                  className="p-2 bg-emerald-100 rounded-full"
                >
                  <Feather name="message-circle" size={18} color="#059669" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
