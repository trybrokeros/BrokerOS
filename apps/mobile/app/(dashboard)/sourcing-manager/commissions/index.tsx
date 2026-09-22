import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';
import { CommissionCompleteModal } from '@/components/commissions/CommissionCompleteModal';
import { useFocusEffect } from 'expo-router';
import { authClient } from '../../../../lib/auth-client';

export default function CommissionsScreen() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchCommissions = async () => {
    try {
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      const res = await authClient.$fetch('/api/brokers/commissions/all', { baseURL: baseUrl });
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchCommissions();
  };

  const handleCompleteClick = (record: any) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const handleConfirmPayment = async (file: any) => {
    if (!selectedRecord) return;
    try {
      setIsSaving(true);
      const baseUrl = process.env.EXPO_PUBLIC_API_URL as string;
      
      const formData = new FormData();
      if (file) {
        formData.append('file', {
          uri: file.uri,
          name: file.name || 'receipt.jpg',
          type: file.mimeType || 'image/jpeg'
        } as any);
      }

      const res = await authClient.$fetch(`/api/brokers/commissions/${selectedRecord.id}/complete`, {
        baseURL: baseUrl,
        method: 'POST',
        body: formData,
      });

      if (!res.error) {
        Toast.show({ type: 'success', text1: 'Success', text2: 'Commission marked as paid successfully' });
        await fetchCommissions();
        setModalVisible(false);
        setSelectedRecord(null);
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to mark commission as paid' });
      }
    } catch (e) {
      console.error(e);
      Toast.show({ type: 'error', text1: 'Error', text2: 'Error updating commission' });
    } finally {
      setIsSaving(false);
    }
  };

  const totalPending = commissions.filter(c => c.status === 'PENDING').reduce((acc, c) => acc + Number(c.netPayable || 0), 0);
  const totalPaid = commissions.filter(c => c.status === 'PAID').reduce((acc, c) => acc + Number(c.paidAmount || 0), 0);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView 
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="p-5 space-y-6">
          <View>
            <Text className="text-3xl font-black text-slate-900 tracking-tight">Commissions</Text>
            <Text className="text-slate-500 mt-1 font-medium">Manage broker payouts</Text>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-amber-50 rounded-2xl p-4 border border-amber-200">
              <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center mb-2">
                <Feather name="clock" size={20} color="#d97706" />
              </View>
              <Text className="text-xs font-bold text-slate-500 uppercase">Pending</Text>
              <Text className="text-xl font-black text-amber-700">₹{totalPending.toLocaleString('en-IN')}</Text>
            </View>
            <View className="flex-1 bg-emerald-50 rounded-2xl p-4 border border-emerald-200">
              <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mb-2">
                <Feather name="check-circle" size={20} color="#059669" />
              </View>
              <Text className="text-xs font-bold text-slate-500 uppercase">Paid</Text>
              <Text className="text-xl font-black text-emerald-700">₹{totalPaid.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <View className="space-y-4">
            {commissions.length === 0 ? (
              <View className="bg-white rounded-2xl p-8 items-center justify-center border border-slate-200 border-dashed">
                <Feather name="briefcase" size={40} color="#cbd5e1" className="mb-3" />
                <Text className="text-slate-600 font-bold">No Commissions Found</Text>
              </View>
            ) : (
              commissions.map(record => (
                <View key={record.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <View className="p-4 border-b border-slate-100 bg-slate-50 flex-row justify-between items-center">
                    <View>
                      <Text className="font-bold text-slate-900 text-base">{record.broker?.name || 'Unknown'}</Text>
                      <View className="flex-row items-center mt-1">
                        <Feather name="home" size={12} color="#64748b" />
                        <Text className="text-xs font-medium text-slate-500 ml-1">
                          {record.booking?.unit?.floor?.tower?.project?.name || 'Unknown Project'}
                        </Text>
                      </View>
                    </View>
                    <View className={`px-2.5 py-1 rounded-full border flex-row items-center gap-1
                      ${record.status === 'PAID' ? 'bg-emerald-100 border-emerald-200' : 'bg-amber-100 border-amber-200'}
                    `}>
                      <Feather name={record.status === 'PAID' ? "check-circle" : "clock"} size={12} color={record.status === 'PAID' ? "#059669" : "#d97706"} />
                      <Text className={`text-[10px] font-bold ${record.status === 'PAID' ? 'text-emerald-700' : 'text-amber-700'}`}>{record.status}</Text>
                    </View>
                  </View>

                  <View className="p-4 flex-row flex-wrap justify-between">
                    <View className="w-[48%] mb-4">
                      <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1">Unit Info</Text>
                      <Text className="text-sm font-bold text-slate-700">T-? / Unit {record.booking?.unit?.unitNumber}</Text>
                    </View>
                    <View className="w-[48%] mb-4">
                      <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1">Booking Value</Text>
                      <Text className="text-sm font-bold text-slate-700">₹{Number(record.bookingValue).toLocaleString('en-IN')}</Text>
                    </View>
                    <View className="w-[48%]">
                      <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1">Commission ({record.brokeragePercent ? `${record.brokeragePercent}%` : 'Flat'})</Text>
                      <Text className="text-base font-black text-emerald-600">₹{Number(record.brokerageAmount).toLocaleString('en-IN')}</Text>
                    </View>
                    {record.status === 'PAID' && (
                      <View className="w-[48%]">
                        <Text className="text-[10px] font-bold text-emerald-600/70 uppercase mb-1">Paid On</Text>
                        <Text className="text-sm font-bold text-emerald-700">{new Date(record.paidAt).toLocaleDateString()}</Text>
                      </View>
                    )}
                  </View>

                  {record.status === 'PENDING' && (
                    <TouchableOpacity 
                      onPress={() => handleCompleteClick(record)}
                      className="p-4 bg-slate-900 items-center justify-center"
                    >
                      <Text className="text-white font-bold">Mark as Paid</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <CommissionCompleteModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setSelectedRecord(null); }}
        onConfirm={handleConfirmPayment}
        isSaving={isSaving}
        commissionAmount={selectedRecord?.netPayable || 0}
      />
    </View>
  );
}
