import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { authClient } from '../../../../lib/auth-client';
import { InboundCommissionReceiveModal } from '../../../../components/commissions/InboundCommissionReceiveModal';

export default function PostSalesCommissionsScreen() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCommissions = async () => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      const res = await authClient.$fetch('/api/dashboard/post-sales/commissions', { baseURL: baseUrl });
      if (!res.error) {
        setCommissions(res.data as any[]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCommissions();
    }, [])
  );

  const handleReceive = async (data: { file: any; remarks: string }) => {
    if (!selectedRecord) return;
    try {
      setIsSaving(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      const res = await authClient.$fetch(`/api/dashboard/post-sales/commissions/${selectedRecord.id}/receive`, {
        method: 'PUT',
        baseURL: baseUrl,
        body: { remarks: data.remarks }
      });
      if (!res.error) {
        Toast.show({ type: 'success', text1: 'Success', text2: 'Commission updated successfully' });
        setModalVisible(false);
        fetchCommissions();
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: res.error.message || 'Failed to update commission' });
      }
    } catch (err: any) {
      Toast.show({ type: 'error', text1: 'Error', text2: err.message || 'Failed to update commission' });
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = commissions.filter(c => filter === 'ALL' || c.status === filter);

  return (
    <View className="flex-1 bg-slate-50">
      <View className="px-6 pt-12 pb-4 bg-white border-b border-slate-200">
        <Text className="text-2xl font-black text-slate-900">Inbound Commissions</Text>
        <Text className="text-slate-500 font-medium mt-1">Track commissions from developers</Text>
      </View>

      <View className="flex-row p-4 gap-2">
        {['ALL', 'PENDING', 'RECEIVED'].map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            className={`flex-1 py-2 rounded-lg items-center justify-center ${filter === f ? 'bg-indigo-600' : 'bg-white border border-slate-200'}`}
          >
            <Text className={`text-xs font-bold ${filter === f ? 'text-white' : 'text-slate-600'}`}>
              {f === 'ALL' ? 'All' : f === 'PENDING' ? 'Pending' : 'Received'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#4f46e5" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCommissions(); }} />}
        >
          {filtered.length === 0 ? (
            <View className="bg-white rounded-2xl border border-slate-200 p-8 items-center mt-10">
              <View className="w-16 h-16 bg-slate-50 rounded-full items-center justify-center mb-4">
                <Feather name="file-text" size={32} color="#94a3b8" />
              </View>
              <Text className="text-lg font-bold text-slate-900 mb-1">No commissions found</Text>
              <Text className="text-slate-500 text-center">Check back later when units are handed over.</Text>
            </View>
          ) : (
            filtered.map((comm) => (
              <View key={comm.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-4 shadow-sm">
                <View className={`h-1.5 w-full ${comm.status === 'RECEIVED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <View className="p-4">
                  <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                      <Text className="text-lg font-bold text-slate-900">{comm.project?.name || 'Unknown Project'}</Text>
                      <View className="flex-row items-center mt-1">
                        <Feather name="home" size={12} color="#64748b" />
                        <Text className="text-xs text-slate-500 font-medium ml-1">Unit {comm.unit?.unitNumber}</Text>
                      </View>
                    </View>
                    <View className={`px-2 py-1 rounded-md ${comm.status === 'RECEIVED' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      <Text className={`text-[10px] font-bold ${comm.status === 'RECEIVED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {comm.status === 'RECEIVED' ? 'RECEIVED' : 'PENDING'}
                      </Text>
                    </View>
                  </View>

                  <View className="bg-slate-50 rounded-xl p-3 mb-4">
                    <Text className="text-xs text-slate-500 font-bold mb-1 uppercase">Expected Commission</Text>
                    <Text className="text-2xl font-black text-emerald-600">₹{Number(comm.commissionAmount).toLocaleString('en-IN')}</Text>
                  </View>

                  <View className="space-y-2 mb-4">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-xs text-slate-500">Customer</Text>
                      <Text className="text-sm font-medium text-slate-900">{comm.booking?.customer?.firstName} {comm.booking?.customer?.lastName}</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-xs text-slate-500">Date Triggered</Text>
                      <Text className="text-sm font-medium text-slate-900">{new Date(comm.createdAt).toLocaleDateString()}</Text>
                    </View>
                  </View>

                  {comm.status === 'PENDING' && (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedRecord(comm);
                        setModalVisible(true);
                      }}
                      className="w-full py-3 bg-indigo-600 rounded-xl items-center justify-center flex-row gap-2 mt-2"
                    >
                      <Feather name="check-circle" size={16} color="white" />
                      <Text className="text-white font-bold text-sm">Mark as Received</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}

      <InboundCommissionReceiveModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleReceive}
        isSaving={isSaving}
        commissionAmount={selectedRecord?.commissionAmount || 0}
      />
    </View>
  );
}
